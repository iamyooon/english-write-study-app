/**
 * 피드백 관련 타입 정의
 */

import { Feedback as DatabaseFeedback } from './database'
import { ErrorDetail, Suggestion, WordAnalysis } from './writing'

export interface Feedback extends DatabaseFeedback {
  errors: ErrorDetail[] | null
  suggestions: Suggestion[] | null
  wordAnalysis: WordAnalysis | null
}

export interface FeedbackDisplayProps {
  feedback: Feedback
  showDiff?: boolean
  showErrors?: boolean
  showSuggestions?: boolean
}

export interface FeedbackQueueItem {
  studyLogId: string
  userId: string
  content: string
  submittedAt: string
  queuePosition: number
  estimatedWaitTime?: number // 예상 대기 시간 (분)
}

export interface FeedbackStats {
  totalSubmissions: number
  averageScore: number
  improvementTrend: 'up' | 'down' | 'stable'
  weeklyStats: {
    week: string
    count: number
    averageScore: number
  }[]
}
