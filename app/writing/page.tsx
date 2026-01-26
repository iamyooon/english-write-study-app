/**
 * Writing 페이지
 * 영어 문장 작성 및 AI 피드백
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { filterProfanity } from '@/lib/safety/profanity-filter'
import toast from 'react-hot-toast'
import DragDropMission from '@/components/DragDropMission'

interface Mission {
  korean: string
  gradeLevel: 'elementary_low' | 'elementary_high'
  grade: number
}

interface DragDropMissionData {
  id: string
  korean: string
  template: string
  blanks: number
  wordOptions: string[]
  correctAnswers: string[]
  grade: number
  level?: number // 호환성을 위해 선택적 속성으로 추가
}

interface Feedback {
  score: number
  feedback: string
  corrected?: string
  hint?: string
  errors?: Array<{
    type: string
    original: string
    corrected: string
    explanation: string
  }>
  suggestions?: string[]
}

export default function WritingPage() {
  const router = useRouter()
  const [mission, setMission] = useState<Mission | null>(null)
  const [dragDropMission, setDragDropMission] = useState<DragDropMissionData | null>(null)
  const [userInput, setUserInput] = useState('')
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [shouldAutoGenerate, setShouldAutoGenerate] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  // URL 파라미터에서 초기 학년 확인 (서버 사이드 렌더링 방지)
  const getInitialGrade = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      // grade 또는 recommended_grade 파라미터 확인
      const gradeParam = urlParams.get('grade') || urlParams.get('recommended_grade')
      if (gradeParam) {
        const gradeValue = parseInt(gradeParam, 10)
        if (gradeValue >= 1 && gradeValue <= 6) {
          return gradeValue
        }
      }
    }
    return null
  }

  const initialGrade = getInitialGrade()
  const [grade, setGrade] = useState<number | null>(initialGrade) // 1-6학년, null이면 학년 선택 안됨
  const [gradeLevel, setGradeLevel] = useState<'elementary_low' | 'elementary_high' | null>(
    initialGrade ? (initialGrade <= 3 ? 'elementary_low' : 'elementary_high') : null
  ) // grade에 따라 자동 설정
  const [energy, setEnergy] = useState<number>(5) // 기본값 5
  const [isInitialized, setIsInitialized] = useState<boolean>(!!initialGrade) // 초기화 완료 여부

  // 학년에 따라 gradeLevel 자동 설정
  useEffect(() => {
    if (grade !== null) {
      setGradeLevel(grade <= 3 ? 'elementary_low' : 'elementary_high')
    }
  }, [grade])

  // 저학년(1-3학년)은 Drag & Drop, 고학년(4-6학년)은 키보드 입력
  const isDragDropMode = grade !== null && grade <= 3

  // 사용자 세션 확인 및 placement_level 가져오기
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        // 세션이 없으면 온보딩으로 즉시 리다이렉트 (화면 렌더링 없이)
        router.replace('/onboarding')
        return
      }

      // URL 파라미터에서 학년 확인 (이미 초기 상태에서 설정되었을 수 있음)
      const urlParams = new URLSearchParams(window.location.search)
      const gradeParam = urlParams.get('grade') || urlParams.get('recommended_grade')
      
      if (gradeParam) {
        const gradeValue = parseInt(gradeParam, 10)
        if (gradeValue >= 1 && gradeValue <= 6) {
          if (grade === null) {
            // 초기 상태에서 설정되지 않았을 경우에만 설정
            setGrade(gradeValue)
            setGradeLevel(gradeValue <= 3 ? 'elementary_low' : 'elementary_high')
          }
          setIsInitialized(true)
          
          // 프로필에서 에너지 정보만 가져오기
          const { data: profile } = await supabase
            .from('profiles')
            .select('energy')
            .eq('id', session.user.id)
            .maybeSingle()
          
          const profileData = profile as { energy?: number } | null
          if (profileData && profileData.energy !== undefined) {
            setEnergy(profileData.energy)
          }
          return
        }
      }
      
      // URL 파라미터에 학년이 없으면 프로필에서 학년 가져오기
      const { data: profile } = await supabase
        .from('profiles')
        .select('grade, energy')
        .eq('id', session.user.id)
        .maybeSingle()

      // 타입 단언 (Supabase 타입 추론 문제 해결)
      const profileData = profile as { grade?: number; energy?: number } | null

      // 학년이 없으면 즉시 온보딩으로 리다이렉트 (화면 렌더링 없이)
      if (!profileData || !profileData.grade || profileData.grade < 1 || profileData.grade > 6) {
        router.replace('/onboarding')
        return
      }

      setGrade(profileData.grade)
      setGradeLevel(profileData.grade <= 3 ? 'elementary_low' : 'elementary_high')
      setIsInitialized(true)

      // 에너지 정보 가져오기
      if (profileData.energy !== undefined) {
        setEnergy(profileData.energy)
      }
    }
    checkSession()
  }, [])

  // 자동 문장 생성 효과
  useEffect(() => {
    if (!shouldAutoGenerate || !feedback) return
    
    console.log('[자동 생성] 시작:', { shouldAutoGenerate, feedbackScore: feedback.score, energy })
    
    const timer = setTimeout(async () => {
      try {
        console.log('[자동 생성] 타이머 실행')
        // 에너지 체크
        if (energy < 1) {
          console.log('[자동 생성] 에너지 부족')
          toast.error('에너지가 부족합니다. 에너지를 충전해주세요.')
          setShouldAutoGenerate(false)
          return
        }
        
        console.log('[자동 생성] 문장 생성 시작')
        // 피드백 초기화
        setFeedback(null)
        setUserInput('')
        setShouldAutoGenerate(false)
        
        // 다음 문장 생성
        await handleGenerateMission()
        console.log('[자동 생성] 문장 생성 완료')
      } catch (error: any) {
        console.error('[자동 생성] 오류:', error)
        toast.error(error.message || '다음 문장 생성에 실패했습니다. 다시 시도해주세요.')
        setShouldAutoGenerate(false)
      }
    }, 2000)
    
    return () => {
      console.log('[자동 생성] 타이머 정리')
      clearTimeout(timer)
    }
  }, [shouldAutoGenerate, feedback, energy])

  // 한글 문장 생성
  const handleGenerateMission = async () => {
    // 학년이 선택되지 않았으면 에러
    if (grade === null || gradeLevel === null) {
      toast.error('먼저 학년을 선택해주세요.')
      return
    }
    
    console.log('[문장 생성] 시작:', { isDragDropMode, gradeLevel, grade, energy })
    setIsGenerating(true)
    try {
      // Drag & Drop 모드인 경우 별도 API 호출 (저학년 1-3학년)
      if (isDragDropMode) {
        console.log('[문장 생성] Drag & Drop 모드 - API 호출 시작')
        const response = await fetch('/api/study/generate-drag-drop-mission', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gradeLevel,
            grade,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || '미션 생성에 실패했습니다.')
        }

        const data = await response.json()
        console.log('[문장 생성] Drag & Drop 미션 생성 완료:', { missionId: data.mission?.id, energy: data.energy })
        setDragDropMission(data.mission)
        setMission(null)
        setUserInput('')
        setFeedback(null)
        
        // 에너지 업데이트
        if (data.energy) {
          console.log('[문장 생성] 에너지 업데이트:', { before: energy, after: data.energy.current })
          setEnergy(data.energy.current)
          // Header의 에너지도 실시간으로 업데이트
          window.dispatchEvent(new Event('energyUpdated'))
          toast.success(`새 미션이 생성되었습니다! (에너지 ${data.energy.current}/100)`, {
            icon: '⚡',
          })
        } else {
          console.log('[문장 생성] 에너지 정보 없음')
          toast.success('새 미션이 생성되었습니다!')
        }
      } else {
        // 키보드 입력 방식 (고학년 4-6학년)
        const response = await fetch('/api/study/generate-mission', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            gradeLevel,
            grade,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || '문장 생성에 실패했습니다.')
        }

        const data = await response.json()
        console.log('[문장 생성] 키보드 입력 미션 생성 완료:', { missionId: data.mission?.id, korean: data.mission?.korean, energy: data.energy })
        setMission(data.mission)
        setDragDropMission(null)
        setUserInput('')
        setFeedback(null)
        
        // 에너지 업데이트
        if (data.energy) {
          console.log('[문장 생성] 에너지 업데이트:', { before: energy, after: data.energy.current })
          setEnergy(data.energy.current)
          // Header의 에너지도 실시간으로 업데이트
          window.dispatchEvent(new Event('energyUpdated'))
          toast.success(`새 문장이 생성되었습니다! (에너지 ${data.energy.current}/100)`, {
            icon: '⚡',
          })
        } else {
          console.log('[문장 생성] 에너지 정보 없음')
          toast.success('새 문장이 생성되었습니다!')
        }
      }
    } catch (error: any) {
      console.error('[문장 생성] 오류 발생:', { error, message: error.message, stack: error.stack })
      
      // 에너지 부족 에러 처리
      if (error.message && error.message.includes('에너지가 부족합니다')) {
        console.log('[문장 생성] 에너지 부족 에러')
        toast.error('⚡ 에너지가 부족합니다! 에너지를 충전해주세요.', {
          duration: 5000,
        })
      } else {
        console.error('[문장 생성] 기타 에러:', error)
        toast.error(error.message || '문장 생성 중 오류가 발생했습니다.')
      }
    } finally {
      console.log('[문장 생성] 완료 (성공/실패 무관)')
      setIsGenerating(false)
    }
  }

  // Drag & Drop 완료 핸들러
  const handleDragDropComplete = async (isCorrect: boolean, userAnswer: string[]) => {
    console.log('[DragDrop 완료] 시작:', { isCorrect, userAnswer, hasDragDropMission: !!dragDropMission })
    if (!dragDropMission) {
      console.warn('[DragDrop 완료] dragDropMission 없음')
      return
    }

    // 힌트 생성 (정답/오답 모두)
    const hint = isCorrect
      ? '잘했어요! 다음 문장도 같은 실력을 발휘해보세요. 문법과 단어 선택에 주의하면서 작성해보세요.'
      : '다음 문장을 작성할 때는 문법 규칙과 단어의 올바른 사용법을 다시 한번 확인해보세요. 천천히 생각하면서 작성하면 더 좋은 결과를 얻을 수 있어요!'
    
    // 피드백 설정 (힌트 포함)
    const feedbackData: Feedback = {
      score: isCorrect ? 100 : 50,
      feedback: isCorrect ? '정답입니다! 잘했어요! 🎉' : '다시 시도해보세요! 💪',
      hint: hint,
    }
    
    console.log('[DragDrop 완료] 피드백 설정:', { score: feedbackData.score, hasHint: !!feedbackData.hint })
    setFeedback(feedbackData)

    if (isCorrect) {
      console.log('[DragDrop 완료] 정답 - 자동 생성 플래그 설정')
      toast.success('정답입니다! 🎉 다음 문장을 생성합니다...', {
        duration: 2000,
      })
      // 자동 생성 플래그 설정
      setShouldAutoGenerate(true)
    } else {
      console.log('[DragDrop 완료] 오답')
      toast.error('다시 시도해보세요! 💪 힌트를 확인해보세요 💡')
    }
  }

  // Writing 제출
  const handleSubmit = async () => {
    console.log('[제출] 시작:', { hasMission: !!mission, userInputLength: userInput.trim().length })
    
    if (!mission) {
      console.warn('[제출] 미션 없음')
      toast.error('먼저 한글 문장을 생성해주세요.')
      return
    }

    if (!userInput.trim()) {
      console.warn('[제출] 입력 없음')
      toast.error('영어 문장을 입력해주세요.')
      return
    }

    // 3중 필터링: 1단계 - 클라이언트 금칙어 필터
    const profanityCheck = filterProfanity(userInput)
    if (!profanityCheck.isValid) {
      console.warn('[제출] 금칙어 필터링 실패:', profanityCheck)
      toast.error(profanityCheck.message || '나쁜 말은 안 돼요!')
      return
    }

    console.log('[제출] 검증 통과, API 호출 시작')
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
          grade: mission.grade,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        console.error('[제출] API 오류 응답:', { status: response.status, error })
        throw new Error(error.error || '제출에 실패했습니다.')
      }

      const data = await response.json()
      console.log('[제출] API 응답 받음:', { queueStatus: data.queueStatus, hasFeedback: !!data.feedback })

      if (data.queueStatus === 'queued') {
        console.log('[제출] 대기열 상태')
        toast('오늘의 무료 평가를 모두 사용했습니다. 내일 다시 시도해주세요!', {
          icon: '⏰',
          duration: 5000,
        })
      } else {
        // 힌트가 없으면 기본 힌트 추가
        if (!data.feedback || !data.feedback.hint || data.feedback.hint.trim() === '') {
          if (!data.feedback) {
            data.feedback = { score: 0, feedback: '평가가 완료되었습니다.' }
          }
          const score = data.feedback?.score || 0
          if (score >= 80) {
            data.feedback.hint = '잘했어요! 다음 문장도 같은 실력을 발휘해보세요. 문법과 단어 선택에 주의하면서 작성해보세요.'
          } else {
            data.feedback.hint = '다음 문장을 작성할 때는 문법 규칙과 단어의 올바른 사용법을 다시 한번 확인해보세요. 천천히 생각하면서 작성하면 더 좋은 결과를 얻을 수 있어요!'
          }
        }
        
        console.log('[제출] 피드백 받음:', { score: data.feedback?.score, hasHint: !!data.feedback?.hint, hint: data.feedback?.hint })
        setFeedback(data.feedback)
        
        // 정답인 경우 (점수가 높은 경우) 자동으로 다음 문장 생성
        const isCorrect = data.feedback?.score >= 80
        console.log('[제출] 정답 여부:', { isCorrect, score: data.feedback?.score })
        if (isCorrect) {
          toast.success('정답입니다! 🎉 다음 문장을 생성합니다...', {
            duration: 2000,
          })
          // 자동 생성 플래그 설정
          console.log('[제출] 자동 생성 플래그 설정')
          setShouldAutoGenerate(true)
        } else {
          toast.success('평가가 완료되었습니다! 힌트를 확인해보세요 💡')
        }
      }
    } catch (error: any) {
      console.error('[제출] 오류 발생:', { error, message: error.message, stack: error.stack })
      toast.error(error.message || '제출 중 오류가 발생했습니다.')
    } finally {
      console.log('[제출] 완료 (성공/실패 무관)')
      setIsSubmitting(false)
    }
  }

  // 학년이 선택되지 않았으면 온보딩 페이지로 즉시 리다이렉트 (화면 렌더링 없이)
  useEffect(() => {
    if (!isInitialized && grade === null) {
      router.replace('/onboarding')
    }
  }, [grade, isInitialized, router])

  // 초기화가 완료되지 않았거나 학년이 없으면 아무것도 렌더링하지 않음 (리다이렉트 중)
  if (!isInitialized || grade === null) {
    return null
  }

  // Drag & Drop 모드 렌더링 (저학년 1-3학년)
  if (isDragDropMode) {
    return (
      <main className="min-h-screen p-4 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-800">
              단어 드래그 미션
            </h1>
            <p className="text-gray-600 mt-2">{grade}학년 - 단어를 드래그하여 문장을 완성하세요!</p>
          </div>
          
          {dragDropMission ? (
            <>
              <DragDropMission key={dragDropMission.id} mission={dragDropMission} onComplete={handleDragDropComplete} />
              
              {/* 피드백 표시 (Drag & Drop 모드) */}
              {feedback && (
                <div className="mt-6 p-6 bg-green-50 border-2 border-green-200 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">평가 결과</h3>
                    <div className="text-2xl font-bold text-indigo-600">{feedback.score}점</div>
                  </div>

                  <div className="text-gray-700">{feedback.feedback}</div>

                  {/* 힌트 표시 (정답/오답 모두 표시) - 항상 표시 */}
                  <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                    <div className="flex items-start gap-2">
                      <span className="text-xl">💡</span>
                      <div>
                        <div className="text-sm font-semibold text-yellow-800 mb-1">다음 문장 힌트</div>
                        <div className="text-sm text-yellow-700">
                          {feedback.hint || (feedback.score >= 80 
                            ? '잘했어요! 다음 문장도 같은 실력을 발휘해보세요.'
                            : '다음 문장을 작성할 때는 문법 규칙과 단어의 올바른 사용법을 다시 한번 확인해보세요.')}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 오답인 경우 다음 문장 생성 버튼 (정답은 자동 생성됨) */}
                  {feedback.score < 80 && (
                    <div className="flex justify-center pt-4">
                      <button
                        onClick={handleGenerateMission}
                        disabled={isGenerating || energy < 1}
                        className={`px-6 py-3 font-semibold rounded-lg transition-all ${
                          energy < 1
                            ? 'bg-gray-400 text-white cursor-not-allowed'
                            : isGenerating
                            ? 'bg-indigo-400 text-white cursor-not-allowed'
                            : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                        }`}
                        title={energy < 1 ? '에너지가 부족합니다 (1 에너지 필요)' : ''}
                      >
                        {isGenerating ? '생성 중...' : energy < 1 ? '⚡ 에너지 부족' : '다음 문장 다시 시도하기 (⚡ 1)'}
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-6 text-center">
                <button
                  onClick={handleGenerateMission}
                  disabled={isGenerating || energy < 1}
                  className={`px-6 py-3 text-white rounded-lg transition-all ${
                    energy < 1
                      ? 'bg-gray-400 cursor-not-allowed'
                      : isGenerating
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                  title={energy < 1 ? '에너지가 부족합니다 (1 에너지 필요)' : ''}
                >
                  {isGenerating ? '생성 중...' : energy < 1 ? '⚡ 에너지 부족' : '새 미션 생성 (⚡ 1)'}
                </button>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
              <div className="space-y-4">
                <div className="text-6xl mb-4">🎯</div>
                <h2 className="text-2xl font-bold text-gray-800">
                  드래그 앤 드롭 미션
                </h2>
                <p className="text-gray-600">
                  {grade}학년은 단어를 드래그하여 문장을 완성하는 방식입니다.
                  <br />
                  아래 버튼을 눌러 미션을 시작해보세요!
                </p>
              </div>
              <button
                onClick={handleGenerateMission}
                disabled={isGenerating || energy < 1}
                className={`px-8 py-4 text-lg font-semibold text-white rounded-lg transition-all shadow-lg ${
                  energy < 1
                    ? 'bg-gray-400 cursor-not-allowed'
                    : isGenerating
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl transform hover:scale-105'
                }`}
                title={energy < 1 ? '에너지가 부족합니다 (1 에너지 필요)' : ''}
              >
                {isGenerating ? '미션 생성 중...' : energy < 1 ? '⚡ 에너지 부족' : '미션 시작하기 (⚡ 1)'}
              </button>
            </div>
          )}
        </div>
      </main>
    )
  }

  // 키보드 입력 모드 렌더링 (고학년 4-6학년)
  return (
    <main className="min-h-screen p-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">
            영어 문장 쓰기
          </h1>
        </div>


        {/* 한글 문장 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">한글 문장</label>
            <button
              onClick={handleGenerateMission}
              disabled={isGenerating || energy < 1}
              className={`px-4 py-2 text-white text-sm rounded-lg transition-all ${
                energy < 1
                  ? 'bg-gray-400 cursor-not-allowed'
                  : isGenerating
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
              title={energy < 1 ? '에너지가 부족합니다 (1 에너지 필요)' : ''}
            >
              {isGenerating ? '생성 중...' : energy < 1 ? '⚡ 에너지 부족' : '새 문장 생성 (⚡ 1)'}
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

            {/* 힌트 표시 (정답/오답 모두 표시) - 항상 표시 */}
            <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-xl">💡</span>
                <div>
                  <div className="text-sm font-semibold text-yellow-800 mb-1">다음 문장 힌트</div>
                  <div className="text-sm text-yellow-700">
                    {feedback.hint || (feedback.score >= 80 
                      ? '잘했어요! 다음 문장도 같은 실력을 발휘해보세요.'
                      : '다음 문장을 작성할 때는 문법 규칙과 단어의 올바른 사용법을 다시 한번 확인해보세요.')}
                  </div>
                </div>
              </div>
            </div>

            {/* 오답인 경우 다음 문장 생성 버튼 (정답은 자동 생성됨) */}
            {feedback.score < 80 && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={handleGenerateMission}
                  disabled={isGenerating || energy < 1}
                  className={`px-6 py-3 font-semibold rounded-lg transition-all ${
                    energy < 1
                      ? 'bg-gray-400 text-white cursor-not-allowed'
                      : isGenerating
                      ? 'bg-indigo-400 text-white cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                  }`}
                  title={energy < 1 ? '에너지가 부족합니다 (1 에너지 필요)' : ''}
                >
                  {isGenerating ? '생성 중...' : energy < 1 ? '⚡ 에너지 부족' : '다음 문장 다시 시도하기 (⚡ 1)'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
