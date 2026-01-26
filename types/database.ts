/**
 * Supabase Database Types
 * 
 * 자동 생성: 2026-01-14T14:51:22.167Z
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
          name: Text
          grade: number | null
          publisher: Text
          level: number
          energy: number
          gems: number
          is_premium: boolean
          vision_usage_today: number
          feedback_usage_today: number
          placement_level: number | null
          energy_last_charged: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name?: Text
          grade?: number | null
          publisher?: Text
          level?: number
          energy?: number
          gems?: number
          is_premium?: boolean
          vision_usage_today?: number
          feedback_usage_today?: number
          placement_level?: number | null
          energy_last_charged?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: Text
          grade?: number | null
          publisher?: Text
          level?: number
          energy?: number
          gems?: number
          is_premium?: boolean
          vision_usage_today?: number
          feedback_usage_today?: number
          placement_level?: number | null
          energy_last_charged?: string | null
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
          energy_gained: number | null
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
          energy_gained?: number | null
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
          energy_gained?: number | null
          created_at?: string
        }
      }
      missions: {
        Row: {
          id: string
          mission_type: 'keyboard' | 'drag_drop'
          grade_level: 'elementary_low' | 'elementary_high'
          grade: number
          unit: number | null
          topic: Text
          order_in_unit: number | null
          mission_data: Json
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          mission_type: 'keyboard' | 'drag_drop'
          grade_level: 'elementary_low' | 'elementary_high'
          grade: number
          unit?: number | null
          topic?: Text
          order_in_unit?: number | null
          mission_data: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          mission_type?: 'keyboard' | 'drag_drop'
          grade_level?: 'elementary_low' | 'elementary_high'
          grade?: number
          unit?: number | null
          topic?: Text
          order_in_unit?: number | null
          mission_data?: Json
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      user_mission_progress: {
        Row: {
          id: string
          user_id: string
          mission_id: string
          completed_at: string
          score: number | null
          attempts: number
        }
        Insert: {
          id?: string
          user_id: string
          mission_id: string
          completed_at?: string
          score?: number | null
          attempts?: number
        }
        Update: {
          id?: string
          user_id?: string
          mission_id?: string
          completed_at?: string
          score?: number | null
          attempts?: number
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

export type Mission = Database['public']['Tables']['missions']['Row']
export type MissionInsert = Database['public']['Tables']['missions']['Insert']
export type MissionUpdate = Database['public']['Tables']['missions']['Update']

export type UserMissionProgress = Database['public']['Tables']['user_mission_progress']['Row']
export type UserMissionProgressInsert = Database['public']['Tables']['user_mission_progress']['Insert']
export type UserMissionProgressUpdate = Database['public']['Tables']['user_mission_progress']['Update']

// 추가 유틸리티 타입
export type PublisherType = 'chunjae' | 'ybm'
export type ShopItemType = 'outfit' | 'decoration'
export type StudyLogStatus = 'completed' | 'queued'

