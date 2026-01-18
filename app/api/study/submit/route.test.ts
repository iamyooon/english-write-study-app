/**
 * Writing 제출 API 통합 테스트
 * 
 * 에너지 시스템 통합 테스트 포함
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

// 모킹
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('@/lib/openai/moderation', () => ({
  moderateContent: vi.fn(),
}))

vi.mock('@/lib/openai/client', () => ({
  openai: {
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
}))

vi.mock('@/lib/supabase/utils', () => ({
  consumeEnergy: vi.fn(),
  produceEnergy: vi.fn(),
}))

describe('POST /api/study/submit', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  }

  const mockProfile = {
    id: 'user-123',
    energy: 100,
    feedback_usage_today: 0,
    is_premium: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('인증 및 유효성 검사', () => {
    it('인증되지 않은 사용자는 401 에러를 받는다', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
          }),
        },
      } as any)

      const request = new Request('http://localhost:3000/api/study/submit', {
        method: 'POST',
        body: JSON.stringify({
          missionText: '나는 사과를 좋아해요',
          userInput: 'I like apples.',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('인증이 필요합니다.')
    })

    it('프로필이 없으면 404 에러를 받는다', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const request = new Request('http://localhost:3000/api/study/submit', {
        method: 'POST',
        body: JSON.stringify({
          missionText: '나는 사과를 좋아해요',
          userInput: 'I like apples.',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('프로필을 찾을 수 없습니다.')
    })

    it('잘못된 요청 데이터는 400 에러를 반환한다', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      const request = new Request('http://localhost:3000/api/study/submit', {
        method: 'POST',
        body: JSON.stringify({
          missionText: '나는 사과를 좋아해요',
          // userInput 누락
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('잘못된 요청 데이터입니다.')
    })
  })

  describe('에너지 시스템 통합', () => {
    it('에너지가 부족하면 403 에러를 반환한다', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const { consumeEnergy } = await import('@/lib/supabase/utils')

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: { ...mockProfile, energy: 50 },
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn(),
              }),
            }),
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn(),
            }),
          }),
        }),
      } as any)

      vi.mocked(consumeEnergy).mockRejectedValue(
        new Error('Insufficient energy: 50/100')
      )

      const request = new Request('http://localhost:3000/api/study/submit', {
        method: 'POST',
        body: JSON.stringify({
          missionText: '나는 사과를 좋아해요',
          userInput: 'I like apples.',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toContain('에너지가 부족합니다')
      expect(data.energyRequired).toBe(100)
      expect(data.currentEnergy).toBe(50)
    })

    it('에너지가 충분하면 미션 시작 시 100 소비한다', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const { consumeEnergy, produceEnergy } = await import('@/lib/supabase/utils')
      const { moderateContent } = await import('@/lib/openai/moderation')
      const { openai } = await import('@/lib/openai/client')

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn(),
              }),
            }),
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'log-123',
                  user_id: 'user-123',
                  mission_text: '나는 사과를 좋아해요',
                  user_input: 'I like apples.',
                  energy_gained: 10,
                },
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      vi.mocked(consumeEnergy).mockResolvedValue({ ...mockProfile, energy: 0 } as any)
      vi.mocked(produceEnergy).mockResolvedValue({ ...mockProfile, energy: 10 } as any)
      vi.mocked(moderateContent).mockResolvedValue({
        flagged: false,
        details: [],
      })

      vi.mocked(openai.chat.completions.create).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                score: 90,
                feedback: '잘했습니다!',
                corrected: 'I like apples.',
                errors: [],
                suggestions: [],
              }),
            },
          },
        ],
      } as any)

      const request = new Request('http://localhost:3000/api/study/submit', {
        method: 'POST',
        body: JSON.stringify({
          missionText: '나는 사과를 좋아해요',
          userInput: 'I like apples.',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(consumeEnergy).toHaveBeenCalledWith('user-123', 100)
      expect(data.success).toBe(true)
      expect(data.energyGained).toBe(10)
    })

    it('미션 완료 시 에너지 +10 생산한다', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const { consumeEnergy, produceEnergy } = await import('@/lib/supabase/utils')
      const { moderateContent } = await import('@/lib/openai/moderation')
      const { openai } = await import('@/lib/openai/client')

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              select: vi.fn().mockReturnValue({
                single: vi.fn(),
              }),
            }),
          }),
          insert: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: {
                  id: 'log-123',
                  user_id: 'user-123',
                  energy_gained: 10,
                },
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      vi.mocked(consumeEnergy).mockResolvedValue({ ...mockProfile, energy: 0 } as any)
      vi.mocked(produceEnergy).mockResolvedValue({ ...mockProfile, energy: 10 } as any)
      vi.mocked(moderateContent).mockResolvedValue({
        flagged: false,
        details: [],
      })

      vi.mocked(openai.chat.completions.create).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                score: 90,
                feedback: '잘했습니다!',
              }),
            },
          },
        ],
      } as any)

      const request = new Request('http://localhost:3000/api/study/submit', {
        method: 'POST',
        body: JSON.stringify({
          missionText: '나는 사과를 좋아해요',
          userInput: 'I like apples.',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(produceEnergy).toHaveBeenCalledWith('user-123', 10)
      expect(data.energyGained).toBe(10)
    })
  })

  describe('OpenAI Moderation 통합', () => {
    it('부적절한 내용 감지 시 400 에러를 반환한다', async () => {
      const { createClient } = await import('@/lib/supabase/server')
      const { consumeEnergy } = await import('@/lib/supabase/utils')
      const { moderateContent } = await import('@/lib/openai/moderation')

      vi.mocked(createClient).mockResolvedValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
          }),
        },
        from: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProfile,
                error: null,
              }),
            }),
          }),
        }),
      } as any)

      vi.mocked(consumeEnergy).mockResolvedValue(mockProfile as any)
      vi.mocked(moderateContent).mockResolvedValue({
        flagged: true,
        details: [{ category: 'violence', severity: 'high' }],
      })

      const request = new Request('http://localhost:3000/api/study/submit', {
        method: 'POST',
        body: JSON.stringify({
          missionText: '나는 사과를 좋아해요',
          userInput: 'inappropriate content',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('부적절한 내용')
      expect(moderateContent).toHaveBeenCalledWith('inappropriate content')
    })
  })
})
