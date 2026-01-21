/**
 * OpenAI Moderation API
 * 
 * 3중 필터링의 두 번째 단계: 서버 사이드 Moderation
 */

import { openai } from './client'

export interface ModerationResult {
  flagged: boolean
  categories?: {
    hate: boolean
    'hate/threatening': boolean
    'self-harm': boolean
    sexual: boolean
    'sexual/minors': boolean
    violence: boolean
    'violence/graphic': boolean
  }
  categoryScores?: Record<string, number>
  details?: string
}

/**
 * 텍스트를 Moderation API로 검사
 */
export async function moderateContent(content: string): Promise<ModerationResult> {
  try {
    const response = await openai.moderations.create({
      input: content,
    })

    const result = response.results[0]

    if (!result) {
      return {
        flagged: false,
      }
    }

    return {
      flagged: result.flagged,
      categories: result.categories,
      categoryScores: result.category_scores as unknown as Record<string, number>,
      details: result.flagged
        ? '부적절한 내용이 감지되었습니다.'
        : undefined,
    }
  } catch (error) {
    console.error('Moderation API 오류:', error)
    // 오류 발생 시 안전을 위해 차단
    return {
      flagged: true,
      details: '콘텐츠 검사 중 오류가 발생했습니다.',
    }
  }
}
