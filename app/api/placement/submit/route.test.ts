/**
 * Placement Test API 엔드포인트 통합 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { createClient } from '@/lib/supabase/server'
import { moderateContent } from '@/lib/openai/moderation'
import { openai } from '@/lib/openai/client'

// 모듈 mock
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

describe('POST /api/placement/submit', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
  }

  const mockProfile = {
    id: 'test-user-id',
    grade: 1,
    level: 1,
    energy: 5,
    gems: 0,
    is_premium: false,
  }

  const validAnswers = [
    {
      question: '나는 사과를 좋아해요.',
      userAnswer: 'I like apples.',
      timeSpent: 30,
    },
    {
      question: '그녀는 학교에 가요.',
      userAnswer: 'She goes to school.',
      timeSpent: 45,
    },
    {
      question: '나는 매일 일찍 일어나요.',
      userAnswer: 'I wake up early every day.',
      timeSpent: 60,
    },
    {
      question: '우리는 친구예요.',
      userAnswer: 'We are friends.',
      timeSpent: 25,
    },
    {
      question: '그는 축구를 좋아해요.',
      userAnswer: 'He likes soccer.',
      timeSpent: 40,
    },
    {
      question: '나는 책을 읽어요.',
      userAnswer: 'I read books.',
      timeSpent: 35,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()

    // 기본 mock 설정: 정상 인증 및 프로필
    vi.mocked(createClient).mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: mockUser },
          error: null,
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
          eq: vi.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        }),
      }),
    } as any)

    // 기본 Moderation: 통과
    vi.mocked(moderateContent).mockResolvedValue({
      flagged: false,
    })

    // 기본 GPT 응답: 정상 평가
    vi.mocked(openai.chat.completions.create).mockResolvedValue({
      choices: [
        {
          message: {
            content: JSON.stringify({
              placement_level: 5,
              score: 85,
              feedback: '잘 하고 있어요! 계속 노력해주세요.',
              strengths: ['문법이 정확해요', '어휘를 잘 사용했어요'],
              areas_for_improvement: ['발음을 더 연습해보세요'],
            }),
          },
        },
      ],
    } as any)
  })

  describe('인증 및 권한', () => {
    it('인증되지 않은 사용자는 401 에러를 받음', async () => {
      vi.mocked(createClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: null },
            error: null,
          }),
        },
      } as any)

      const request = new Request('http://localhost/api/placement/submit', {
        method: 'POST',
        body: JSON.stringify({
          answers: validAnswers,
          gradeLevel: 'elementary_low',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('인증이 필요합니다.')
    })

    it('프로필이 없는 사용자는 404 에러를 받음', async () => {
      vi.mocked(createClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
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

      const request = new Request('http://localhost/api/placement/submit', {
        method: 'POST',
        body: JSON.stringify({
          answers: validAnswers,
          gradeLevel: 'elementary_low',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(404)
      expect(data.error).toBe('프로필을 찾을 수 없습니다.')
    })
  })

  describe('입력 검증', () => {
    it('답변이 5개 미만이면 400 에러를 받음', async () => {
      const request = new Request('http://localhost/api/placement/submit', {
        method: 'POST',
        body: JSON.stringify({
          answers: validAnswers.slice(0, 4), // 4개만
          gradeLevel: 'elementary_low',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toContain('잘못된 요청 데이터')
    })

    it('답변이 7개를 초과하면 400 에러를 받음', async () => {
      const request = new Request('http://localhost/api/placement/submit', {
        method: 'POST',
        body: JSON.stringify({
          answers: [...validAnswers, ...validAnswers.slice(0, 2)], // 8개
          gradeLevel: 'elementary_low',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
    })

    it('잘못된 gradeLevel 값이면 400 에러를 받음', async () => {
      const request = new Request('http://localhost/api/placement/submit', {
        method: 'POST',
        body: JSON.stringify({
          answers: validAnswers,
          gradeLevel: 'invalid_grade', // 잘못된 값
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
    })
  })

  describe('OpenAI Moderation 검사', () => {
    it('모든 답변이 Moderation을 통과하면 GPT 평가로 진행', async () => {
      // 모든 답변이 통과하도록 설정
      vi.mocked(moderateContent).mockResolvedValue({
        flagged: false,
      })

      const request = new Request('http://localhost/api/placement/submit', {
        method: 'POST',
        body: JSON.stringify({
          answers: validAnswers,
          gradeLevel: 'elementary_low',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.placement_level).toBe(5)
      // 모든 답변이 Moderation 검사를 받았는지 확인
      expect(moderateContent).toHaveBeenCalledTimes(validAnswers.length)
    })

    it('부적절한 내용이 감지되면 400 에러를 반환하고 GPT 평가를 건너뜀', async () => {
      // 첫 번째 답변은 통과, 두 번째 답변에서 부적절한 내용 감지
      vi.mocked(moderateContent)
        .mockResolvedValueOnce({ flagged: false }) // 첫 번째 통과
        .mockResolvedValueOnce({
          // 두 번째 부적절
          flagged: true,
          details: '부적절한 내용이 감지되었습니다.',
        })

      const request = new Request('http://localhost/api/placement/submit', {
        method: 'POST',
        body: JSON.stringify({
          answers: validAnswers,
          gradeLevel: 'elementary_low',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('부적절한 내용이 감지되었습니다.')
      expect(data.questionIndex).toBe(2) // 두 번째 문항
      // GPT 평가가 호출되지 않았는지 확인
      expect(openai.chat.completions.create).not.toHaveBeenCalled()
    })

    it('마지막 답변에서 부적절한 내용이 감지되어도 즉시 중단', async () => {
      // 마지막 답변만 부적절
      vi.mocked(moderateContent)
        .mockResolvedValueOnce({ flagged: false })
        .mockResolvedValueOnce({ flagged: false })
        .mockResolvedValueOnce({ flagged: false })
        .mockResolvedValueOnce({ flagged: false })
        .mockResolvedValueOnce({ flagged: false })
        .mockResolvedValueOnce({
          flagged: true,
          details: '부적절한 내용이 감지되었습니다.',
        })

      const request = new Request('http://localhost/api/placement/submit', {
        method: 'POST',
        body: JSON.stringify({
          answers: validAnswers,
          gradeLevel: 'elementary_low',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.questionIndex).toBe(6) // 마지막 문항
    })
  })

  describe('GPT 평가 및 결과 저장', () => {
    it('정상적인 플로우에서 placement_level을 저장하고 반환', async () => {
      const request = new Request('http://localhost/api/placement/submit', {
        method: 'POST',
        body: JSON.stringify({
          answers: validAnswers,
          gradeLevel: 'elementary_low',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.placement_level).toBe(5)
      expect(data.evaluation).toBeDefined()
      expect(data.evaluation.score).toBe(85)
      expect(data.evaluation.feedback).toBeDefined()
    })

    it('GPT 응답이 없는 경우 500 에러를 반환', async () => {
      vi.mocked(openai.chat.completions.create).mockResolvedValue({
        choices: [{ message: { content: null } }],
      } as any)

      const request = new Request('http://localhost/api/placement/submit', {
        method: 'POST',
        body: JSON.stringify({
          answers: validAnswers,
          gradeLevel: 'elementary_low',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('평가 결과를 생성할 수 없습니다.')
    })

    it('placement_level이 범위를 벗어나면 1-10으로 클램핑', async () => {
      // placement_level이 15로 응답되는 경우
      vi.mocked(openai.chat.completions.create).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                placement_level: 15, // 범위를 벗어남
                score: 100,
                feedback: '완벽해요!',
                strengths: [],
                areas_for_improvement: [],
              }),
            },
          },
        ],
      } as any)

      const request = new Request('http://localhost/api/placement/submit', {
        method: 'POST',
        body: JSON.stringify({
          answers: validAnswers,
          gradeLevel: 'elementary_low',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.placement_level).toBe(10) // 10으로 클램핑됨
    })

    it('placement_level이 0 이하이면 1로 클램핑', async () => {
      vi.mocked(openai.chat.completions.create).mockResolvedValue({
        choices: [
          {
            message: {
              content: JSON.stringify({
                placement_level: -5, // 음수
                score: 50,
                feedback: '노력해주세요',
                strengths: [],
                areas_for_improvement: [],
              }),
            },
          },
        ],
      } as any)

      const request = new Request('http://localhost/api/placement/submit', {
        method: 'POST',
        body: JSON.stringify({
          answers: validAnswers,
          gradeLevel: 'elementary_low',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(data.placement_level).toBe(1) // 1로 클램핑됨
    })

    it('프로필 업데이트 실패 시 500 에러를 반환', async () => {
      vi.mocked(createClient).mockReturnValue({
        auth: {
          getUser: vi.fn().mockResolvedValue({
            data: { user: mockUser },
            error: null,
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
            eq: vi.fn().mockResolvedValue({
              data: null,
              error: new Error('Database error'),
            }),
          }),
        }),
      } as any)

      const request = new Request('http://localhost/api/placement/submit', {
        method: 'POST',
        body: JSON.stringify({
          answers: validAnswers,
          gradeLevel: 'elementary_low',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('결과 저장에 실패했습니다.')
    })
  })

  describe('에러 처리', () => {
    it('JSON 파싱 오류 시 500 에러를 반환 (실제 동작)', async () => {
      // Request의 body가 invalid json인 경우, request.json()에서 에러 발생
      // 실제로는 500 에러가 반환됨 (catch 블록에서 처리)
      const request = new Request('http://localhost/api/placement/submit', {
        method: 'POST',
        body: 'invalid json',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const response = await POST(request)
      const data = await response.json()

      // 실제로는 JSON 파싱 에러가 발생하여 500이 반환됨
      expect(response.status).toBe(500)
      expect(data.error).toBe('제출 중 오류가 발생했습니다.')
    })

    it('예상치 못한 오류 발생 시 500 에러를 반환', async () => {
      vi.mocked(createClient).mockImplementation(() => {
        throw new Error('Unexpected error')
      })

      const request = new Request('http://localhost/api/placement/submit', {
        method: 'POST',
        body: JSON.stringify({
          answers: validAnswers,
          gradeLevel: 'elementary_low',
        }),
      })

      const response = await POST(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.error).toBe('제출 중 오류가 발생했습니다.')
    })
  })
})
