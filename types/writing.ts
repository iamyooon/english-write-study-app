/**
 * Writing 관련 타입 정의
 */

import { StudyLog, Feedback } from './database'
import { GradeLevel } from './user'

export type ContentType = 'text' | 'photo'

export type QueueStatus = 'pending' | 'processing' | 'completed' | 'failed'

export interface WritingSubmission {
  content: string
  contentType: ContentType
  photoUrl?: string | null
  level: number
  gradeLevel: GradeLevel
}

export interface WritingWithFeedback extends StudyLog {
  feedback: Feedback | null
}

export interface ModerationResult {
  passed: boolean
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
  details?: Record<string, unknown>
}

export interface FeedbackAnalysis {
  score: number
  feedbackText: string
  correctedText?: string | null
  errors: ErrorDetail[]
  suggestions: Suggestion[]
  wordAnalysis: WordAnalysis
}

export interface ErrorDetail {
  type: 'grammar' | 'spelling' | 'vocabulary' | 'syntax' | 'punctuation'
  original: string
  corrected: string
  explanation: string
  position?: {
    start: number
    end: number
  }
}

export interface Suggestion {
  type: 'improvement' | 'alternative' | 'tip'
  text: string
  priority: 'high' | 'medium' | 'low'
}

export interface WordAnalysis {
  totalWords: number
  uniqueWords: number
  educationWords: string[] // 교육부 필수 800단어 중 사용된 단어
  educationWordCount: number
  difficultyLevel: 'easy' | 'medium' | 'hard'
  wordFrequency: Record<string, number>
}
