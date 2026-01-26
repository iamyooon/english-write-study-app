/**
 * 온보딩 페이지
 * 게스트 모드 진입 → 저학년/고학년 선택
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function OnboardingPage() {
  const router = useRouter()
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null) // 1-6학년
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [showPlacementOption, setShowPlacementOption] = useState(false)

  // 상태 변경 추적을 위한 로그
  useEffect(() => {
    console.log('[온보딩] 상태 변경:', {
      isCheckingAuth,
      isLoggedIn,
      isLoading,
      selectedGrade,
      timestamp: new Date().toISOString()
    })
  }, [isCheckingAuth, isLoggedIn, isLoading, selectedGrade])

  // 로그인 상태 확인
  useEffect(() => {
    console.log('[온보딩] useEffect 시작 - 세션 확인 시작')
    let isMounted = true
    let subscription: { unsubscribe: () => void } | null = null
    let sessionResolved = false
    
    const supabase = createClient()
    
    // 프로필 조회 및 학년 설정 함수
    const loadProfileAndSetGrade = async (userId: string) => {
      console.log('[온보딩] 프로필 조회 시작:', userId)
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('grade')
          .eq('id', userId)
          .maybeSingle()

        console.log('[온보딩] 프로필 조회 완료:', { profile, profileError })

        // 타입 단언 (Supabase 타입 추론 문제 해결)
        const profileData = profile as { grade?: number } | null

        if (isMounted && !profileError) {
          // 학년 정보 설정
          if (profileData?.grade) {
            console.log('[온보딩] 프로필에서 학년 정보 발견:', profileData.grade)
            if (profileData.grade >= 1 && profileData.grade <= 6) {
              setSelectedGrade(profileData.grade)
            }
          } else {
            console.log('[온보딩] 프로필에 학년 정보 없음')
          }
        }
      } catch (profileError) {
        console.warn('[온보딩] 프로필 로드 실패:', profileError)
      }
    }
    
    // 세션 확인 완료 처리 함수
    const handleSessionFound = (session: any) => {
      if (!isMounted || sessionResolved) return
      sessionResolved = true
      
      console.log('[온보딩] 세션 확인됨:', session.user.id)
      setIsLoggedIn(true)
      setIsCheckingAuth(false)
      
      // 프로필 조회
      loadProfileAndSetGrade(session.user.id)
    }
    
    // 세션 없음 처리 함수
    const handleNoSession = () => {
      if (!isMounted || sessionResolved) return
      sessionResolved = true
      
      console.log('[온보딩] 세션 없음, 홈으로 리다이렉트')
      setIsCheckingAuth(false)
      router.push('/')
    }
    
    // onAuthStateChange를 먼저 구독 (이벤트를 놓치지 않기 위해)
    console.log('[온보딩] onAuthStateChange 구독 시작')
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[온보딩] onAuthStateChange 이벤트:', event, session?.user?.id)
      
      if (!isMounted || sessionResolved) {
        console.log('[온보딩] 이미 처리됨 또는 언마운트됨, 무시')
        return
      }
      
      if (session && (event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED')) {
        handleSessionFound(session)
        if (authSubscription) {
          authSubscription.unsubscribe()
        }
      } else if (!session && event === 'SIGNED_OUT') {
        handleNoSession()
        if (authSubscription) {
          authSubscription.unsubscribe()
        }
      }
    })
    
    subscription = authSubscription
    
    // 동시에 getSession()도 시도 (더 빠를 수 있음)
    console.log('[온보딩] getSession() 호출 시작')
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        console.log('[온보딩] getSession() 완료:', { 
          hasSession: !!session, 
          userId: session?.user?.id,
          error 
        })
        
        if (!isMounted || sessionResolved) {
          console.log('[온보딩] 이미 처리됨, 무시')
          return
        }
        
        if (session && !error) {
          handleSessionFound(session)
          if (subscription) {
            subscription.unsubscribe()
          }
        } else if (!session) {
          // 세션이 없으면 onAuthStateChange가 처리하도록 기다림
          // 1초 후에도 세션이 없으면 리다이렉트
          setTimeout(() => {
            if (!isMounted || sessionResolved) return
            console.log('[온보딩] 1초 후에도 세션 없음, 리다이렉트')
            handleNoSession()
            if (subscription) {
              subscription.unsubscribe()
            }
          }, 1000)
        }
      })
      .catch((error) => {
        console.error('[온보딩] getSession() 오류:', error)
        // 오류 발생 시 onAuthStateChange가 처리하도록 기다림
        setTimeout(() => {
          if (!isMounted || sessionResolved) return
          console.log('[온보딩] getSession() 오류 후 1초 대기, 리다이렉트')
          handleNoSession()
          if (subscription) {
            subscription.unsubscribe()
          }
        }, 1000)
      })

    return () => {
      console.log('[온보딩] useEffect cleanup - isMounted = false')
      isMounted = false
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [router])

  // URL 파라미터에서 Placement Test 결과 확인
  useEffect(() => {
    if (!isLoggedIn) return

    const urlParams = new URLSearchParams(window.location.search)
    const recommendedGradeParam = urlParams.get('recommended_grade')

    if (recommendedGradeParam) {
      const recommendedGrade = parseInt(recommendedGradeParam, 10)
      // Placement Test 결과에 따라 학년 설정
      const storedResult = sessionStorage.getItem('placement_result')
      if (storedResult) {
        const result = JSON.parse(storedResult)
        // 추천 학년이 있으면 사용
        if (result.recommended_grade && result.recommended_grade >= 1 && result.recommended_grade <= 6) {
          setSelectedGrade(result.recommended_grade)
        }
      } else if (recommendedGrade >= 1 && recommendedGrade <= 6) {
        setSelectedGrade(recommendedGrade)
      }
    }
  }, [isLoggedIn])

  // 기존 placement_level이 있어도 자동 리다이렉트하지 않음 (사용자가 학년을 선택할 수 있도록)
  // useEffect(() => {
  //   if (existingPlacementLevel && isLoggedIn && !isLoading) {
  //     console.log('[온보딩] 기존 placement_level 발견, Writing으로 리다이렉트')
  //     router.push(`/writing?placement_level=${existingPlacementLevel}`)
  //   }
  // }, [existingPlacementLevel, isLoggedIn, isLoading, router])

  const handleContinue = async () => {
    if (!selectedGrade) return

    setIsLoading(true)
    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        router.push('/')
        return
      }

      // 프로필 업데이트 또는 생성
      const profileData: any = {
        grade: selectedGrade, // 1-6학년
      }

      // 프로필 확인 및 업데이트
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle()

      if (existingProfile) {
        // 기존 프로필 업데이트 (이름 유지)
        const existingProfileData = existingProfile as { name?: string } | null
        const updateData = {
          ...profileData,
          // 기존 이름이 있으면 유지
          name: existingProfileData?.name || profileData.name,
        }
        // 타입 단언 (Supabase 타입 추론 문제 해결)
        const updateSupabase = supabase as any
        await updateSupabase
          .from('profiles')
          .update(updateData)
          .eq('id', session.user.id)
      } else {
        // 새 프로필 생성
        await supabase
          .from('profiles')
          .insert({
            id: session.user.id,
            ...profileData,
          })
      }
      
      // 프로필 업데이트 후 헤더에 알림
      window.dispatchEvent(new Event('profileUpdated'))

      // Placement Test 재시도 옵션이 활성화되었으면 Placement Test로
      if (showPlacementOption) {
        toast.success('레벨테스트를 시작합니다!')
        // 학년에 따라 gradeLevel 결정 (1-3: elementary_low, 4-6: elementary_high)
        const gradeLevel = selectedGrade! <= 3 ? 'elementary_low' : 'elementary_high'
        router.push(`/placement?gradeLevel=${gradeLevel}&retake=true`)
      } 
      // 바로 학습 시작
      else {
        toast.success('학습을 시작합니다!')
        router.push(`/writing?recommended_grade=${selectedGrade}`)
      }
    } catch (error: any) {
      console.error('온보딩 오류:', error)
      toast.error(error.message || '오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  // 렌더링 로그
  console.log('[온보딩] 렌더링:', {
    isCheckingAuth,
    isLoggedIn,
    isLoading,
    selectedGrade,
    willShowLoading: isCheckingAuth
  })

  if (isCheckingAuth) {
    console.log('[온보딩] 로딩 화면 표시')
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </main>
    )
  }

  console.log('[온보딩] 메인 화면 표시')

  // 기존 placement_level이 있어도 학년 선택 화면을 표시 (자동 리다이렉트 제거)
  // if (existingPlacementLevel && isLoggedIn) {
  //   return (
  //     <main className="min-h-screen flex items-center justify-center p-4">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
  //         <p className="mt-4 text-gray-600">학습 페이지로 이동 중...</p>
  //       </div>
  //     </main>
  //   )
  // }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            시작하기
          </h1>
          <p className="text-gray-600 text-sm mb-2">
            학년을 선택해주세요
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
            <p className="text-xs text-blue-800 text-left">
              💡 <strong>학년</strong>: 현재 다니는 학년 또는 Placement Test로 추천받은 학년<br/>
              💡 <strong>저학년(1-3학년)</strong>: Drag & Drop 방식으로 학습<br/>
              💡 <strong>고학년(4-6학년)</strong>: 키보드 입력 방식으로 학습
            </p>
          </div>
        </div>

        {/* 학년 선택 */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            학년을 선택해주세요
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                disabled={isLoading}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  selectedGrade === grade
                    ? 'bg-indigo-600 text-white shadow-lg scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="text-lg font-semibold">{grade}학년</div>
              </button>
            ))}
          </div>
        </div>

        {/* Placement Test 재시도 옵션 */}
        {selectedGrade && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700 mb-3">
              Placement Test를 통해 적절한 학년을 추천받을 수 있습니다.
            </p>
            <button
              onClick={() => setShowPlacementOption(true)}
              disabled={isLoading}
              className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
                !isLoading
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              레벨테스트를 받고 싶어요
            </button>
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={handleContinue}
            disabled={!selectedGrade || isLoading}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
              selectedGrade && !isLoading
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? '준비 중...' : showPlacementOption ? '레벨테스트 시작' : '학습 시작하기'}
          </button>
        </div>
      </div>
    </main>
  )
}
