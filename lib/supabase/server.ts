/**
 * Supabase Server Client (서버 사이드용)
 * 
 * Next.js Server Components, Server Actions, API Routes에서 사용합니다.
 * 쿠키를 통한 세션 관리가 자동으로 처리됩니다.
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

/**
 * 현재 사용자 세션 가져오기
 */
export async function getSession() {
  const supabase = await createClient()
  return await supabase.auth.getSession()
}

/**
 * 현재 사용자 정보 가져오기
 */
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * 현재 사용자의 프로필 가져오기
 */
export async function getProfile(userId?: string) {
  const supabase = await createClient()
  const user = userId || (await getUser())?.id
  
  if (!user) {
    return null
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }

  return data
}

/**
 * 서비스 역할 클라이언트 (관리자용)
 * 
 * ⚠️ 주의: Service Role Key는 절대 클라이언트에 노출하지 마세요!
 * 서버 사이드에서만 사용하며, RLS를 우회합니다.
 */
export function createServiceRoleClient() {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return []
        },
        setAll() {
          // Service Role은 쿠키를 사용하지 않음
        },
      },
    }
  )
}
