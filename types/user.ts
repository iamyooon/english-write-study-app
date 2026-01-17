/**
 * 사용자 관련 타입 정의
 */

import { Profile } from './database'

export type GradeLevel = 'elementary_low' | 'elementary_high'

export type SubscriptionType = 'free' | 'premium'

export interface UserProfile extends Profile {
  // 추가 필드가 필요한 경우 여기에 정의
}

export interface UserSession {
  user: {
    id: string
    email: string | null
  }
  profile: UserProfile | null
}

export interface ParentConsent {
  parentEmail: string
  consentGiven: boolean
  consentDate: string
}

export interface UserPreferences {
  language: 'ko' | 'en'
  notificationsEnabled: boolean
  soundEnabled: boolean
}
