/**
 * 온보딩 페이지
 * 게스트 모드 진입 → 저학년/고학년 선택
 */

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function OnboardingPage() {
  const router = useRouter()
  const [selectedGrade, setSelectedGrade] = useState<'elementary_low' | 'elementary_high' | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = async () => {
    if (!selectedGrade) return

    setIsLoading(true)
    try {
      // 게스트 계정 생성
      const response = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gradeLevel: selectedGrade,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '게스트 계정 생성에 실패했습니다.')
      }

      const { session } = await response.json()

      // Supabase 클라이언트에 세션 저장
      const supabase = createClient()
      if (session) {
        await supabase.auth.setSession(session)
      }

      toast.success('시작 준비가 완료되었습니다!')
      // Placement Test 페이지로 이동
      router.push('/placement')
    } catch (error: any) {
      console.error('온보딩 오류:', error)
      toast.error(error.message || '오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            수준을 선택해주세요
          </h1>
          <p className="text-gray-600 text-sm">
            맞는 수준을 선택하면 더 좋은 학습 경험을 제공할 수 있어요
          </p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => setSelectedGrade('elementary_low')}
            disabled={isLoading}
            className={`w-full px-6 py-4 rounded-lg font-medium transition-all ${
              selectedGrade === 'elementary_low'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-lg font-semibold">저학년</div>
            <div className="text-sm mt-1">초등 1-3학년</div>
          </button>

          <button
            onClick={() => setSelectedGrade('elementary_high')}
            disabled={isLoading}
            className={`w-full px-6 py-4 rounded-lg font-medium transition-all ${
              selectedGrade === 'elementary_high'
                ? 'bg-indigo-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <div className="text-lg font-semibold">고학년</div>
            <div className="text-sm mt-1">초등 4-6학년</div>
          </button>
        </div>

        <button
          onClick={handleContinue}
          disabled={!selectedGrade || isLoading}
          className={`w-full px-6 py-4 rounded-lg font-semibold transition-all ${
            selectedGrade && !isLoading
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isLoading ? '준비 중...' : '시작하기'}
        </button>
      </div>
    </main>
  )
}
