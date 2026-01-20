/**
 * Supabase 인증 콜백 라우트
 * 이메일 인증 링크 클릭 시 처리
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/onboarding'

  if (code) {
    const supabase = await createClient()
    
    try {
      // 인증 코드를 세션으로 교환
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('인증 코드 교환 실패:', error)
        // 에러 페이지로 리다이렉트
        return NextResponse.redirect(
          new URL(`/?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
        )
      }

      // 성공 시 온보딩 페이지로 리다이렉트
      return NextResponse.redirect(new URL(next, requestUrl.origin))
    } catch (error: any) {
      console.error('인증 콜백 오류:', error)
      return NextResponse.redirect(
        new URL(`/?error=${encodeURIComponent('인증 처리 중 오류가 발생했습니다.')}`, requestUrl.origin)
      )
    }
  }

  // 코드가 없으면 홈으로 리다이렉트
  return NextResponse.redirect(new URL('/', requestUrl.origin))
}
