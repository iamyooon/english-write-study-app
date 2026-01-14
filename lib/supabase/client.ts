/**
 * Supabase Client (클라이언트 사이드용)
 * 
 * 브라우저에서 사용하는 Supabase 클라이언트입니다.
 * RLS 정책이 적용되어 사용자는 자신의 데이터만 접근할 수 있습니다.
 */

import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/database'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// 싱글톤 인스턴스 (선택사항)
let supabaseClient: ReturnType<typeof createClient> | undefined

export function getClient() {
  if (!supabaseClient) {
    supabaseClient = createClient()
  }
  return supabaseClient
}
