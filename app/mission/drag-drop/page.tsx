/**
 * 저학년용 Drag & Drop 미션 페이지
 * Level 1: 단어 카드를 드래그하여 문장 완성
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DragDropMission from '@/components/DragDropMission'
import toast from 'react-hot-toast'

interface Mission {
  id: string
  korean: string
  template: string
  blanks: number
  wordOptions: string[]
  correctAnswers: string[]
  level: number
}

function DragDropMissionPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mission, setMission] = useState<Mission | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [level, setLevel] = useState(1)

  useEffect(() => {
    const loadMission = async () => {
      try {
        // URL 파라미터에서 레벨 확인
        const levelParam = searchParams.get('level')
        if (levelParam) {
          setLevel(parseInt(levelParam, 10))
        }

        // 세션 확인
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          toast.error('로그인이 필요합니다.')
          router.push('/login')
          return
        }

        // 프로필에서 레벨 확인
        const { data: profile } = await supabase
          .from('profiles')
          .select('placement_level, grade')
          .eq('id', session.user.id)
          .maybeSingle()

        const profileData = profile as { placement_level?: number; grade?: number } | null
        if (profileData?.placement_level) {
          setLevel(profileData.placement_level)
        }

        // 미션 생성 (임시 - 추후 API로 대체)
        const sampleMission: Mission = {
          id: 'mission-1',
          korean: '오늘 좋아하는 과일은?',
          template: 'I like ___ today.',
          blanks: 1,
          wordOptions: ['apple', 'banana', 'orange', 'grape'],
          correctAnswers: ['apple'],
          level: level,
        }

        setMission(sampleMission)
      } catch (error) {
        console.error('미션 로드 오류:', error)
        toast.error('미션을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    loadMission()
  }, [router, searchParams])

  const handleComplete = (isCorrect: boolean, userAnswer: string[]) => {
    if (isCorrect) {
      setTimeout(() => {
        toast.success('다음 미션으로 이동합니다!')
        // 다음 미션으로 이동하거나 홈으로 리다이렉트
        router.push('/writing')
      }, 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">미션을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!mission) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <p className="text-gray-600">미션을 찾을 수 없습니다.</p>
          <button
            onClick={() => router.push('/writing')}
            className="mt-4 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <DragDropMission mission={mission} onComplete={handleComplete} />
    </div>
  )
}

export default function DragDropMissionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    }>
      <DragDropMissionPageContent />
    </Suspense>
  )
}
