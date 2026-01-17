/**
 * Supabase Middleware Client
 * 
 * Next.js Middleware에서 사용하는 Supabase 클라이언트입니다.
 * 쿠키 읽기/쓰기를 직접 처리합니다.
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { Database } from '@/types/database'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // 세션 새로고침 (만료된 세션 갱신)
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // 인증이 필요한 경로 체크
  const protectedPaths = ['/writing', '/library', '/report', '/shop', '/character']
  const authPaths = ['/login', '/signup']
  const guestPaths = ['/onboarding']

  const pathname = request.nextUrl.pathname
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path))
  const isGuestPath = guestPaths.some((path) => pathname.startsWith(path))

  // 로그인하지 않은 사용자가 보호된 경로 접근 시
  if (isProtectedPath && !user) {
    const redirectUrl = new URL('/onboarding', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 로그인한 사용자가 인증 페이지 접근 시
  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/writing', request.url))
  }

  return supabaseResponse
}
