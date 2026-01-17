/**
 * Placement Test 페이지
 * 게스트 모드에서 레벨을 추천받기 위한 테스트
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Question {
  id: number
  korean: string
  instruction: string
  expected_keywords?: string[]
}

interface Answer {
  question: string
  userAnswer: string
  timeSpent: number
}

export default function PlacementTestPage() {
  const router = useRouter()
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [startTime, setStartTime] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [gradeLevel, setGradeLevel] = useState<'elementary_low' | 'elementary_high'>('elementary_low')

  // 세션 확인 및 학년 정보 가져오기
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/onboarding')
        return
      }

      // 프로필에서 학년 정보 가져오기
      const { data: profile } = await supabase
        .from('profiles')
        .select('grade')
        .eq('id', session.user.id)
        .single()

      if (profile?.grade) {
        setGradeLevel(profile.grade <= 3 ? 'elementary_low' : 'elementary_high')
      }
    }
    checkSession()
  }, [router])

  // Placement Test 문항 로드
  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(
          `/api/placement/questions?gradeLevel=${gradeLevel}&count=6`
        )

        if (!response.ok) {
          throw new Error('문항을 불러올 수 없습니다.')
        }

        const data = await response.json()
        setQuestions(data.questions || [])
        setStartTime(Date.now())
      } catch (error: any) {
        console.error('문항 로드 오류:', error)
        toast.error(error.message || '문항을 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoading(false)
      }
    }

    if (gradeLevel) {
      loadQuestions()
    }
  }, [gradeLevel])

  const currentQuestion = questions[currentQuestionIndex]

  const handleNext = () => {
    if (!currentAnswer.trim()) {
      toast.error('답변을 입력해주세요.')
      return
    }

    if (!startTime) {
      toast.error('시간 측정 오류가 발생했습니다.')
      return
    }

    const timeSpent = Math.floor((Date.now() - startTime) / 1000) // 초 단위

    setAnswers([
      ...answers,
      {
        question: currentQuestion.korean,
        userAnswer: currentAnswer.trim(),
        timeSpent,
      },
    ])

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
      setCurrentAnswer('')
      setStartTime(Date.now())
    } else {
      // 마지막 문항이면 제출
      handleSubmit([
        ...answers,
        {
          question: currentQuestion.korean,
          userAnswer: currentAnswer.trim(),
          timeSpent,
        },
      ])
    }
  }

  const handleSubmit = async (finalAnswers: Answer[]) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/placement/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          answers: finalAnswers,
          gradeLevel,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '제출에 실패했습니다.')
      }

      const data = await response.json()

      toast.success('테스트가 완료되었습니다!', {
        duration: 3000,
      })

      // 결과를 보여주고 Writing 페이지로 이동
      setTimeout(() => {
        router.push(`/writing?placement_level=${data.placement_level}`)
      }, 2000)
    } catch (error: any) {
      console.error('제출 오류:', error)
      toast.error(error.message || '제출 중 오류가 발생했습니다.')
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">문항을 준비하고 있어요...</p>
        </div>
      </main>
    )
  }

  if (questions.length === 0) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600">문항을 불러올 수 없습니다.</p>
          <button
            onClick={() => router.push('/onboarding')}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            돌아가기
          </button>
        </div>
      </main>
    )
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100

  return (
    <main className="min-h-screen p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6">
        {/* 진행 바 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>진행 상황</span>
            <span>
              {currentQuestionIndex + 1} / {questions.length}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* 격려 문구 */}
        <div className="text-center">
          <p className="text-lg text-gray-700">
            {currentQuestionIndex === 0 && '🎯 잘 할 수 있어요! 천천히 답해주세요.'}
            {currentQuestionIndex > 0 &&
              currentQuestionIndex < questions.length - 1 &&
              '💪 잘 하고 있어요! 계속 화이팅!'}
            {currentQuestionIndex === questions.length - 1 && '✨ 마지막 문항이에요!'}
          </p>
        </div>

        {/* 현재 문항 */}
        <div className="space-y-4">
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <div className="text-sm text-gray-600 mb-2">한글 문장</div>
            <div className="text-2xl font-bold text-gray-800 mb-4">
              {currentQuestion.korean}
            </div>
            <div className="text-sm text-gray-600">{currentQuestion.instruction}</div>
          </div>

          {/* 답변 입력 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              영어로 번역해주세요
            </label>
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              disabled={isSubmitting}
              className="w-full h-32 p-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="여기에 영어 문장을 작성해주세요..."
              autoFocus
            />
          </div>
        </div>

        {/* 다음 버튼 */}
        <div className="flex justify-center">
          <button
            onClick={handleNext}
            disabled={!currentAnswer.trim() || isSubmitting}
            className={`px-8 py-3 font-semibold rounded-lg transition-all ${
              currentAnswer.trim() && !isSubmitting
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
          >
            {isSubmitting
              ? '평가 중...'
              : currentQuestionIndex < questions.length - 1
              ? '다음 문항'
              : '제출하기'}
          </button>
        </div>
      </div>
    </main>
  )
}
