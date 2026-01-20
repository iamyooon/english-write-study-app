/**
 * 홈 페이지
 * 게스트 모드 진입점
 * 세션이 있고 placement_level이 있으면 Writing 페이지로 리다이렉트
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        // 프로필에서 placement_level 확인
        const { data: profile } = await supabase
          .from('profiles')
          .select('placement_level')
          .eq('id', session.user.id)
          .single()

        // 이미 Placement Test를 완료한 경우 Writing 페이지로 리다이렉트
        if (profile?.placement_level) {
          router.push('/writing')
          return
        }
      }
    }

    checkSession()
  }, [router])

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            영어 Writing 놀이터
          </h1>
          <p className="text-gray-600">
            아이 혼자 쓰고 AI가 코치해주는
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/onboarding"
            className="block w-full px-6 py-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 transition-all shadow-lg hover:shadow-xl text-center"
          >
            시작하기
          </Link>

          <div className="text-center text-sm text-gray-500">
            게스트 모드로 시작할 수 있습니다
          </div>
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
