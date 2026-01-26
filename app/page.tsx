/**
 * 홈 페이지
 * 로그인 상태 확인 후 로그인/회원가입 선택
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  // 로그인 상태 확인
  useEffect(() => {
    let isMounted = true
    
    const checkSession = async () => {
      try {
        const supabase = createClient()
        
        // 세션 확인 (타임아웃 제거 - 완료될 때까지 기다림)
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('홈페이지 세션 확인:', { 
          hasSession: !!session, 
          userId: session?.user?.id,
          error 
        })

        if (!isMounted) return

        if (session && !error) {
          console.log('로그인 상태 확인됨, 프로필 확인 후 리다이렉트')
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('grade')
            .eq('id', session.user.id)
            .maybeSingle()

          const profileData = profile as { grade?: number } | null
          const hasGrade =
            !!profileData?.grade &&
            profileData.grade >= 1 &&
            profileData.grade <= 6

          if (profileError) {
            console.warn('프로필 조회 오류:', profileError)
          }

          setIsLoading(false) // 리다이렉트 전에 로딩 상태 해제
          router.replace(hasGrade ? '/writing' : '/onboarding')
          return
        }
        
        setIsLoggedIn(false)
        setIsLoading(false) // 로그인하지 않은 경우에도 로딩 상태 해제
      } catch (error) {
        console.error('세션 확인 오류:', error)
        if (isMounted) {
          setIsLoggedIn(false)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    checkSession()

    return () => {
      isMounted = false
    }
  }, [router])

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </main>
    )
  }

  // 로그인하지 않은 경우에만 로그인/회원가입 화면 표시
  if (isLoggedIn) {
    return null // 리다이렉트 중이므로 아무것도 표시하지 않음
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            We Word Planet
          </h1>
          <p className="text-gray-600">
            아이 혼자 쓰고 AI가 코치해주는 영어 Writing 놀이터
          </p>
        </div>

        {/* 로그인/회원가입 선택 */}
        <div className="space-y-3">
          <Link
            href="/login"
            className="block w-full px-6 py-4 rounded-lg font-medium transition-all bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 text-center"
          >
            <div className="text-lg font-semibold">로그인</div>
            <div className="text-sm mt-1">기존 계정으로 로그인</div>
          </Link>

          <Link
            href="/signup"
            className="block w-full px-6 py-4 rounded-lg font-medium transition-all bg-gray-100 text-gray-700 hover:bg-gray-200 text-center"
          >
            <div className="text-lg font-semibold">회원가입</div>
            <div className="text-sm mt-1">새 계정 만들기</div>
          </Link>
        </div>

        <div className="pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-400 text-center">
            초등학생을 위한 안전한 영어 학습 환경
          </p>
        </div>
      </div>
    </main>
  )
}
