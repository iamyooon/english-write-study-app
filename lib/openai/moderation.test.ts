/**
 * OpenAI Moderation 모듈 유닛 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { moderateContent, type ModerationResult } from './moderation'
import { openai } from './client'

// OpenAI 클라이언트 mock
vi.mock('./client', () => ({
  openai: {
    moderations: {
      create: vi.fn(),
    },
  },
}))

describe('moderateContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('정상적인 콘텐츠', () => {
    it('부적절한 내용이 없는 경우 flagged를 false로 반환', async () => {
      // Mock: 부적절한 내용 없음
      vi.mocked(openai.moderations.create).mockResolvedValue({
        results: [
          {
            flagged: false,
            categories: {
              hate: false,
              'hate/threatening': false,
              'self-harm': false,
              sexual: false,
              'sexual/minors': false,
              violence: false,
              'violence/graphic': false,
            },
            category_scores: {},
          },
        ],
      } as any)

      const result = await moderateContent('I like apples.')

      expect(result.flagged).toBe(false)
      expect(result.details).toBeUndefined()
      expect(openai.moderations.create).toHaveBeenCalledWith({
        input: 'I like apples.',
      })
    })

    it('초등학생 수준의 일반적인 영어 문장을 통과시킴', async () => {
      vi.mocked(openai.moderations.create).mockResolvedValue({
        results: [
          {
            flagged: false,
            categories: {},
            category_scores: {},
          },
        ],
      } as any)

      const result = await moderateContent('I am happy today. I go to school.')

      expect(result.flagged).toBe(false)
    })
  })

  describe('부적절한 콘텐츠 감지', () => {
    it('부적절한 내용이 감지되면 flagged를 true로 반환', async () => {
      vi.mocked(openai.moderations.create).mockResolvedValue({
        results: [
          {
            flagged: true,
            categories: {
              hate: true,
              'hate/threatening': false,
              'self-harm': false,
              sexual: false,
              'sexual/minors': false,
              violence: false,
              'violence/graphic': false,
            },
            category_scores: {
              hate: 0.8,
            },
          },
        ],
      } as any)

      const result = await moderateContent('inappropriate content')

      expect(result.flagged).toBe(true)
      expect(result.details).toBe('부적절한 내용이 감지되었습니다.')
      expect(result.categories?.hate).toBe(true)
    })

    it('폭력적인 내용을 감지함', async () => {
      vi.mocked(openai.moderations.create).mockResolvedValue({
        results: [
          {
            flagged: true,
            categories: {
              hate: false,
              'hate/threatening': false,
              'self-harm': false,
              sexual: false,
              'sexual/minors': false,
              violence: true,
              'violence/graphic': false,
            },
            category_scores: {
              violence: 0.9,
            },
          },
        ],
      } as any)

      const result = await moderateContent('violent content')

      expect(result.flagged).toBe(true)
      expect(result.categories?.violence).toBe(true)
    })
  })

  describe('에러 처리', () => {
    it('API 오류 발생 시 안전을 위해 차단 (flagged: true)', async () => {
      vi.mocked(openai.moderations.create).mockRejectedValue(
        new Error('API Error')
      )

      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      const result = await moderateContent('test content')

      expect(result.flagged).toBe(true)
      expect(result.details).toBe('콘텐츠 검사 중 오류가 발생했습니다.')
      expect(consoleErrorSpy).toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('결과가 없는 경우 flagged를 false로 반환', async () => {
      vi.mocked(openai.moderations.create).mockResolvedValue({
        results: [],
      } as any)

      const result = await moderateContent('test content')

      expect(result.flagged).toBe(false)
    })

    it('결과 배열의 첫 번째 항목이 undefined인 경우 안전하게 처리', async () => {
      vi.mocked(openai.moderations.create).mockResolvedValue({
        results: [undefined],
      } as any)

      const result = await moderateContent('test content')

      expect(result.flagged).toBe(false)
    })
  })

  describe('실제 사용 시나리오', () => {
    it('Placement Test 답변 검사 시나리오: 정상 답변', async () => {
      const validAnswers = [
        'I like apples.',
        'She goes to school.',
        'They play soccer.',
      ]

      vi.mocked(openai.moderations.create).mockResolvedValue({
        results: [
          {
            flagged: false,
            categories: {},
            category_scores: {},
          },
        ],
      } as any)

      for (const answer of validAnswers) {
        const result = await moderateContent(answer)
        expect(result.flagged).toBe(false)
      }
    })

    it('Placement Test 답변 검사 시나리오: 부적절한 답변 감지', async () => {
      vi.mocked(openai.moderations.create)
        .mockResolvedValueOnce({
          results: [
            {
              flagged: false,
              categories: {},
              category_scores: {},
            },
          ],
        } as any)
        .mockResolvedValueOnce({
          results: [
            {
              flagged: true,
              categories: { hate: true },
              category_scores: { hate: 0.8 },
            },
          ],
        } as any)

      const normalAnswer = await moderateContent('I like apples.')
      expect(normalAnswer.flagged).toBe(false)

      const inappropriateAnswer = await moderateContent('inappropriate')
      expect(inappropriateAnswer.flagged).toBe(true)
    })
  })
})
