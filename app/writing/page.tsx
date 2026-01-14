/**
 * Writing 페이지
 * 영어 문장 작성 및 AI 피드백
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { filterProfanity } from '@/lib/safety/profanity-filter'
import toast from 'react-hot-toast'

interface Mission {
  korean: string
  gradeLevel: 'elementary_low' | 'elementary_high'
  level: number
}

interface Feedback {
  score: number
  feedback: string
  corrected?: string
  errors?: Array<{
    type: string
    original: string
    corrected: string
    explanation: string
  }>
  suggestions?: string[]
}

export default function WritingPage() {
  const [mission, setMission] = useState<Mission | null>(null)
  const [userInput, setUserInput] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [gradeLevel, setGradeLevel] = useState<'elementary_low' | 'elementary_high'>('elementary_low')
  const [level, setLevel] = useState(1)

  // 사용자 세션 확인
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        // 세션이 없으면 온보딩으로 리다이렉트
        window.location.href = '/onboarding'
      }
    }
    checkSession()
  }, [])

  // 한글 문장 생성
  const handleGenerateMission = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/study/generate-mission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gradeLevel,
          level,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '문장 생성에 실패했습니다.')
      }

      const data = await response.json()
      setMission(data.mission)
      setUserInput('')
      setFeedback(null)
      toast.success('새 문장이 생성되었습니다!')
    } catch (error: any) {
      console.error('문장 생성 오류:', error)
      toast.error(error.message || '문장 생성 중 오류가 발생했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  // Writing 제출
  const handleSubmit = async () => {
    if (!mission) {
      toast.error('먼저 한글 문장을 생성해주세요.')
      return
    }

    if (!userInput.trim()) {
      toast.error('영어 문장을 입력해주세요.')
      return
    }

    // 3중 필터링: 1단계 - 클라이언트 금칙어 필터
    const profanityCheck = filterProfanity(userInput)
    if (!profanityCheck.isValid) {
      toast.error(profanityCheck.message || '나쁜 말은 안 돼요!')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/study/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          missionText: mission.korean,
          userInput: userInput.trim(),
          gradeLevel: mission.gradeLevel,
          level: mission.level,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '제출에 실패했습니다.')
      }

      const data = await response.json()

      if (data.queueStatus === 'queued') {
        toast('오늘의 무료 평가를 모두 사용했습니다. 내일 다시 시도해주세요!', {
          icon: '⏰',
          duration: 5000,
        })
      } else {
        setFeedback(data.feedback)
        toast.success('평가가 완료되었습니다!')
      }
    } catch (error: any) {
      console.error('제출 오류:', error)
      toast.error(error.message || '제출 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center">
          영어 문장 쓰기
        </h1>

        {/* 수준 선택 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">수준 선택</label>
          <div className="flex gap-4">
            <button
              onClick={() => setGradeLevel('elementary_low')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                gradeLevel === 'elementary_low'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              저학년
            </button>
            <button
              onClick={() => setGradeLevel('elementary_high')}
              className={`px-6 py-3 rounded-lg font-medium transition-all ${
                gradeLevel === 'elementary_high'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              고학년
            </button>
          </div>
        </div>

        {/* 한글 문장 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">한글 문장</label>
            <button
              onClick={handleGenerateMission}
              disabled={isGenerating}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? '생성 중...' : '새 문장 생성'}
            </button>
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 min-h-[80px] flex items-center">
            {mission ? (
              <p className="text-xl font-medium text-gray-800">{mission.korean}</p>
            ) : (
              <p className="text-gray-400">
                "새 문장 생성" 버튼을 클릭하여 한글 문장을 받아보세요.
              </p>
            )}
          </div>
        </div>

        {/* 영어 입력 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            위 한글 문장을 영어로 작성해보세요
          </label>
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            disabled={!mission || isSubmitting}
            className="w-full h-32 p-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="여기에 영어 문장을 작성해주세요..."
          />
        </div>

        {/* 제출 버튼 */}
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={!mission || !userInput.trim() || isSubmitting}
            className={`px-8 py-3 font-semibold rounded-lg transition-all ${
              mission && userInput.trim() && !isSubmitting
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
          >
            {isSubmitting ? '평가 중...' : 'AI 평가 (Evaluate)'}
          </button>
        </div>

        {/* 피드백 표시 */}
        {feedback && (
          <div className="mt-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">평가 결과</h3>
              <div className="text-2xl font-bold text-indigo-600">{feedback.score}점</div>
            </div>

            <div className="text-gray-700">{feedback.feedback}</div>

            {feedback.corrected && (
              <div className="p-3 bg-white rounded border border-gray-200">
                <div className="text-sm text-gray-600 mb-1">교정된 문장:</div>
                <div className="font-medium">{feedback.corrected}</div>
              </div>
            )}

            {feedback.errors && feedback.errors.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-700">발견된 오류:</div>
                {feedback.errors.map((error, index) => (
                  <div key={index} className="p-3 bg-white rounded border border-gray-200">
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{error.original}</span> →{' '}
                      <span className="font-medium text-green-600">{error.corrected}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{error.explanation}</div>
                  </div>
                ))}
              </div>
            )}

            {feedback.suggestions && feedback.suggestions.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-700">개선 제안:</div>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  {feedback.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
