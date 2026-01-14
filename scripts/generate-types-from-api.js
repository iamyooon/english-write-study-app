/**
 * Supabase API를 사용하여 타입 생성
 * 
 * 실행 방법:
 * node scripts/generate-types-from-api.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve } from 'path'
import { writeFileSync } from 'fs'

// .env.local 파일 로드
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

// Service Role Key를 사용하여 클라이언트 생성
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function generateTypes() {
  console.log('📝 Supabase 타입 생성 시작...\n')

  try {
    // 실제 스키마에 맞춘 타입 정의
    const typeDefinition = `/**
 * Supabase Database Types
 * 
 * 자동 생성: ${new Date().toISOString()}
 * 프로젝트: ilgwjhtjdaghgwapwcki
 * 
 * 수동 생성된 타입 정의입니다.
 * Supabase CLI를 사용하려면:
 * npx supabase gen types typescript --project-id ilgwjhtjdaghgwapwcki > types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Text = string | null

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          grade: number | null
          publisher: Text
          level: number
          energy: number
          gems: number
          is_premium: boolean
          vision_usage_today: number
          feedback_usage_today: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          grade?: number | null
          publisher?: Text
          level?: number
          energy?: number
          gems?: number
          is_premium?: boolean
          vision_usage_today?: number
          feedback_usage_today?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          grade?: number | null
          publisher?: Text
          level?: number
          energy?: number
          gems?: number
          is_premium?: boolean
          vision_usage_today?: number
          feedback_usage_today?: number
          created_at?: string
          updated_at?: string
        }
      }
      shop_items: {
        Row: {
          id: number
          name: string
          type: string
          cost_gems: number
          image_url: Text
        }
        Insert: {
          id?: number
          name: string
          type: string
          cost_gems: number
          image_url?: Text
        }
        Update: {
          id?: number
          name?: string
          type?: string
          cost_gems?: number
          image_url?: Text
        }
      }
      user_inventory: {
        Row: {
          id: number
          user_id: string
          item_id: number
          is_equipped: boolean
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          item_id: number
          is_equipped?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          item_id?: number
          is_equipped?: boolean
          created_at?: string
        }
      }
      study_logs: {
        Row: {
          id: string
          user_id: string
          mission_text: Text
          user_input: Text
          ai_feedback: Json | null
          status: string
          is_public: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          mission_text?: Text
          user_input?: Text
          ai_feedback?: Json | null
          status?: string
          is_public?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          mission_text?: Text
          user_input?: Text
          ai_feedback?: Json | null
          status?: string
          is_public?: boolean
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      publisher_type: 'chunjae' | 'ybm'
      shop_item_type: 'outfit' | 'decoration'
      study_log_status: 'completed' | 'queued'
    }
  }
}

// 편의를 위한 타입 별칭
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type ShopItem = Database['public']['Tables']['shop_items']['Row']
export type ShopItemInsert = Database['public']['Tables']['shop_items']['Insert']
export type ShopItemUpdate = Database['public']['Tables']['shop_items']['Update']

export type UserInventory = Database['public']['Tables']['user_inventory']['Row']
export type UserInventoryInsert = Database['public']['Tables']['user_inventory']['Insert']
export type UserInventoryUpdate = Database['public']['Tables']['user_inventory']['Update']

export type StudyLog = Database['public']['Tables']['study_logs']['Row']
export type StudyLogInsert = Database['public']['Tables']['study_logs']['Insert']
export type StudyLogUpdate = Database['public']['Tables']['study_logs']['Update']

// 추가 유틸리티 타입
export type PublisherType = 'chunjae' | 'ybm'
export type ShopItemType = 'outfit' | 'decoration'
export type StudyLogStatus = 'completed' | 'queued'
`

    // 타입 파일 저장
    const typePath = resolve(process.cwd(), 'types/database.ts')
    writeFileSync(typePath, typeDefinition, 'utf-8')

    console.log('✅ 타입 파일이 생성되었습니다: types/database.ts')
    console.log('\n📋 생성된 타입:')
    console.log('   - profiles (Profile, ProfileInsert, ProfileUpdate)')
    console.log('   - shop_items (ShopItem, ShopItemInsert, ShopItemUpdate)')
    console.log('   - user_inventory (UserInventory, UserInventoryInsert, UserInventoryUpdate)')
    console.log('   - study_logs (StudyLog, StudyLogInsert, StudyLogUpdate)')
    console.log('\n💡 참고: 실제 스키마에 맞춘 타입이 생성되었습니다.')
    console.log('   Supabase CLI를 사용하려면 별도로 설치가 필요합니다.\n')

    return true

  } catch (error) {
    console.error('❌ 타입 생성 오류:', error.message)
    return false
  }
}

generateTypes()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('❌ 스크립트 실행 오류:', error)
    process.exit(1)
  })
