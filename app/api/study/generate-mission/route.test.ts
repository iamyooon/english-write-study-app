/**
 * /api/study/generate-mission API 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'
import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai/client'

// Mock dependencies
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
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

describe('POST /api/study/generate-mission', () => {
  const mockUser = { id: 'test-user-id' }
  const mockProfile = { id: 'test-user-id', grade: 3 }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('인증되지 않은 사용자는 401 에러를 받아야 함', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    }

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

    const request = new Request('http://localhost/api/study/generate-mission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gradeLevel: 'elementary_low',
        level: 1,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.error).toBe('인증이 필요합니다.')
  })

  it('유효한 요청 시 미션을 생성해야 함 (어휘와 예시 포함)', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile }),
          }),
        }),
      }),
    }

    const mockOpenAIResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              korean: '나는 사과를 좋아해요',
              vocabulary: ['I', 'like', 'apple'],
              example: 'I like apples.',
            }),
          },
        },
      ],
    }

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    vi.mocked(openai.chat.completions.create).mockResolvedValue(
      mockOpenAIResponse as any
    )

    const request = new Request('http://localhost/api/study/generate-mission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gradeLevel: 'elementary_low',
        level: 1,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.mission).toHaveProperty('korean')
    expect(data.mission).toHaveProperty('vocabulary')
    expect(data.mission).toHaveProperty('example')
    expect(data.mission.korean).toBe('나는 사과를 좋아해요')
    expect(Array.isArray(data.mission.vocabulary)).toBe(true)
    expect(data.mission.vocabulary.length).toBeGreaterThan(0)
    expect(data.mission.example).toBeTruthy()
  })

  it('vocabulary가 없어도 빈 배열로 처리해야 함', async () => {
    const mockSupabase = {
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: mockUser } }),
      },
      from: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockProfile }),
          }),
        }),
      }),
    }

    const mockOpenAIResponse = {
      choices: [
        {
          message: {
            content: JSON.stringify({
              korean: '나는 사과를 좋아해요',
              example: 'I like apples.',
            }),
          },
        },
      ],
    }

    vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
    vi.mocked(openai.chat.completions.create).mockResolvedValue(
      mockOpenAIResponse as any
    )

    const request = new Request('http://localhost/api/study/generate-mission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gradeLevel: 'elementary_low',
        level: 1,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(Array.isArray(data.mission.vocabulary)).toBe(true)
  })

  it('잘못된 요청 데이터는 400 에러를 반환해야 함', async () => {
    const request = new Request('http://localhost/api/study/generate-mission', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gradeLevel: 'invalid',
        level: 1,
      }),
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('잘못된 요청 데이터입니다.')
  })
})
