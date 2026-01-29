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

  // 환경 변수 확인
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('⚠️ Supabase 환경 변수가 설정되지 않았습니다.')
    console.error('📝 .env.local 파일을 생성하고 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정해주세요.')
    console.error('📖 참고: ENV_TEMPLATE.md 또는 SUPABASE_PROJECT_SETUP.md 파일을 확인하세요.')
    // 환경 변수가 없어도 앱이 계속 실행되도록 기본값 반환
    return supabaseResponse
  }

  const supabase = createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
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
  const isHomePage = pathname === '/'

  // 홈페이지 접근 시 로그인된 사용자는 무조건 온보딩으로 리다이렉트
  // 온보딩에서 "학습 시작하기"를 눌러야만 /writing으로 이동
  if (isHomePage && user) {
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  // 로그인하지 않은 사용자가 보호된 경로 접근 시
  if (isProtectedPath && !user) {
    const redirectUrl = new URL('/onboarding', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // 로그인한 사용자가 /writing 접근 시 학년 확인
  if (pathname.startsWith('/writing') && user) {
    try {
      // URL 파라미터에 학년이 있으면 통과 (grade 또는 recommended_grade)
      const gradeParam = request.nextUrl.searchParams.get('grade') || 
                         request.nextUrl.searchParams.get('recommended_grade')
      
      if (gradeParam) {
        const gradeValue = parseInt(gradeParam, 10)
        if (!isNaN(gradeValue) && gradeValue >= 1 && gradeValue <= 6) {
          // 학년 파라미터가 유효하면 통과 (온보딩에서 "학습 시작하기"로 온 경우)
          console.log('[미들웨어] /writing 접근 - 학년 파라미터 확인됨:', gradeParam, '통과')
          return supabaseResponse
        } else {
          console.log('[미들웨어] /writing 접근 - 학년 파라미터가 유효하지 않음:', gradeParam)
        }
      } else {
        console.log('[미들웨어] /writing 접근 - 학년 파라미터 없음, 프로필 확인 필요')
      }

      // URL 파라미터에 학년이 없으면 프로필에서 확인
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('grade')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        console.error('미들웨어 /writing 프로필 조회 오류:', profileError)
        // 프로필 조회 실패 시 온보딩으로 보냄
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }

      const profileData = profile as { grade?: number } | null
      const hasGrade =
        !!profileData?.grade &&
        typeof profileData.grade === 'number' &&
        profileData.grade >= 1 &&
        profileData.grade <= 6

      if (!hasGrade) {
        // 학년이 없으면 /onboarding으로 리다이렉트
        return NextResponse.redirect(new URL('/onboarding', request.url))
      }

      // 학년이 있으면 URL 파라미터에 추가하여 리다이렉트
      const redirectUrl = new URL('/writing', request.url)
      if (profileData?.grade) {
        redirectUrl.searchParams.set('grade', profileData.grade.toString())
      }
      return NextResponse.redirect(redirectUrl)
    } catch (error) {
      console.error('미들웨어 /writing 처리 오류:', error)
      // 오류 발생 시 온보딩으로 보냄
      return NextResponse.redirect(new URL('/onboarding', request.url))
    }
  }

  // 로그인한 사용자가 인증 페이지 접근 시
  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/writing', request.url))
  }

  return supabaseResponse
}
