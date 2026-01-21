/**
 * 설정 모달 컴포넌트
 * 이름 변경 등 설정 기능 제공
 */

'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  userId?: string | null
}

export default function SettingsModal({ isOpen, onClose, userId }: SettingsModalProps) {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    console.log('[설정 모달] useEffect 실행:', { isOpen })
    if (isOpen) {
      console.log('[설정 모달] 모달이 열림, 프로필 로드 시작')
      loadProfile()
    } else {
      console.log('[설정 모달] 모달이 닫힘')
    }
  }, [isOpen])

  const loadProfile = async () => {
    console.log('[설정 모달] loadProfile 시작')
    setIsLoading(true)
    console.log('[설정 모달] setIsLoading(true) 호출됨')
    
    try {
      console.log('[설정 모달] Supabase 클라이언트 생성 시작')
      const supabase = createClient()
      console.log('[설정 모달] Supabase 클라이언트 생성 완료')
      
      // 타임아웃 설정 (2초)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          console.warn('[설정 모달] 세션 조회 타임아웃 (2초)')
          reject(new Error('세션 조회 타임아웃'))
        }, 2000)
      })
      
      console.log('[설정 모달] 세션 조회 시작')
      const sessionPromise = supabase.auth.getSession()
      
      let session: any = null
      
      try {
        const result = await Promise.race([sessionPromise, timeoutPromise]) as any
        console.log('[설정 모달] 세션 조회 완료:', { 
          hasSession: !!result?.data?.session,
          userId: result?.data?.session?.user?.id
        })
        session = result?.data?.session || null
      } catch (timeoutError) {
        console.warn('[설정 모달] 세션 조회 타임아웃 발생, 기본값 사용')
        // 타임아웃 발생 시에도 입력 필드는 활성화
        setIsLoading(false)
        setName('')
        return
      }

      if (!session) {
        console.log('[설정 모달] 세션이 없음, 모달 닫기')
        setIsLoading(false)
        onClose()
        return
      }

      console.log('[설정 모달] 프로필 조회 시작:', { userId: session.user.id })
      const profileStartTime = Date.now()
      
      const { data: profile, error: loadError } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', session.user.id)
        .maybeSingle()

      const profileEndTime = Date.now()
      // 타입 단언 (Supabase 타입 추론 문제 해결)
      const profileData = profile as { name?: string | null } | null

      console.log('[설정 모달] 프로필 조회 완료:', { 
        duration: `${profileEndTime - profileStartTime}ms`,
        profile,
        loadError,
        profileName: profileData?.name
      })

      if (profileData?.name) {
        console.log('[설정 모달] 프로필 이름 설정:', profileData.name)
        setName(profileData.name)
      } else {
        console.log('[설정 모달] 프로필 이름 없음, 빈 문자열 설정')
        setName('')
      }
    } catch (error) {
      console.error('[설정 모달] 프로필 로드 오류:', {
        error,
        errorType: typeof error,
        errorMessage: error instanceof Error ? error.message : String(error)
      })
      // 에러 발생 시에도 입력 필드는 활성화
      setName('')
    } finally {
      console.log('[설정 모달] loadProfile finally 블록 실행')
      setIsLoading(false)
      console.log('[설정 모달] setIsLoading(false) 호출됨')
      console.log('[설정 모달] loadProfile 종료')
    }
  }

  const handleSave = async () => {
    console.log('[설정 모달] handleSave 시작')
    console.log('[설정 모달] 입력된 이름:', name)
    
    if (!name.trim() || name.trim().length < 2) {
      console.log('[설정 모달] 이름 검증 실패: 최소 2자 이상 필요')
      toast.error('이름은 최소 2자 이상이어야 합니다.')
      return
    }

    console.log('[설정 모달] 이름 검증 통과, 저장 시작')
    setIsSaving(true)
    console.log('[설정 모달] setIsSaving(true) 호출됨')
    
    try {
      console.log('[설정 모달] Supabase 클라이언트 생성 시작')
      const supabase = createClient()
      console.log('[설정 모달] Supabase 클라이언트 생성 완료')
      
      // Header에서 전달받은 userId 사용
      if (userId) {
        console.log('[설정 모달] Header에서 전달받은 userId 사용:', userId)
        // userId가 있으면 직접 사용 (세션 조회 불필요)
      } else {
        console.log('[설정 모달] userId가 없음, 세션 조회 시작')
        // 타임아웃 설정 (2초)
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            console.warn('[설정 모달] 세션 조회 타임아웃 (2초)')
            reject(new Error('세션 조회 타임아웃'))
          }, 2000)
        })
        
        const sessionPromise = supabase.auth.getSession()
        
        let session: any = null
        
        try {
          const result = await Promise.race([sessionPromise, timeoutPromise]) as any
          console.log('[설정 모달] 세션 조회 완료:', { 
            hasSession: !!result?.data?.session,
            userId: result?.data?.session?.user?.id,
            error: result?.error
          })
          session = result?.data?.session || null
        } catch (timeoutError) {
          console.warn('[설정 모달] 세션 조회 타임아웃 발생')
          throw new Error('세션을 확인할 수 없습니다. 페이지를 새로고침해주세요.')
        }

        if (!session) {
          console.error('[설정 모달] 세션이 없음, 저장 중단')
          toast.error('로그인이 필요합니다.')
          setIsSaving(false)
          onClose()
          return
        }
        
        // 세션에서 userId 추출
        userId = session.user.id
      }

      if (!userId) {
        console.error('[설정 모달] userId가 없음, 저장 중단')
        toast.error('로그인이 필요합니다.')
        setIsSaving(false)
        onClose()
        return
      }

      const trimmedName = name.trim()
      console.log('[설정 모달] 이름 저장 시도:', { 
        userId: userId, 
        name: trimmedName,
        nameLength: trimmedName.length
      })

      console.log('[설정 모달] upsert 호출 시작')
      const upsertStartTime = Date.now()
      
      // 타입 단언 (Supabase 타입 추론 문제 해결)
      const upsertSupabase = supabase as any
      
      // upsert 사용 (프로필이 없으면 생성, 있으면 업데이트)
      const { data: updatedProfile, error } = await upsertSupabase
        .from('profiles')
        .upsert({
          id: userId,
          name: trimmedName,
        }, {
          onConflict: 'id'
        })
        .select()
        .single()

      const upsertEndTime = Date.now()
      console.log('[설정 모달] upsert 호출 완료:', {
        duration: `${upsertEndTime - upsertStartTime}ms`,
        updatedProfile,
        error
      })

      if (error) {
        console.error('[설정 모달] 이름 저장 에러 상세:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          fullError: error
        })
        throw error
      }

      // 타입 단언 (Supabase 타입 추론 문제 해결)
      const updatedProfileData = updatedProfile as { name?: string | null } | null

      console.log('[설정 모달] 에러 없음, 결과 확인 시작')
      console.log('[설정 모달] updatedProfile:', updatedProfile)
      console.log('[설정 모달] updatedProfile?.name:', updatedProfileData?.name)
      console.log('[설정 모달] trimmedName:', trimmedName)
      console.log('[설정 모달] 이름 일치 여부:', updatedProfileData?.name === trimmedName)

      // 저장 후 확인
      if (updatedProfileData && updatedProfileData.name === trimmedName) {
        console.log('[설정 모달] 이름 저장 성공:', updatedProfileData)
        toast.success('이름이 변경되었습니다!')
        
        console.log('[설정 모달] profileUpdated 이벤트 디스패치 시작')
        // 헤더에 이름 업데이트 알림 (즉시 반영)
        window.dispatchEvent(new Event('profileUpdated'))
        console.log('[설정 모달] 첫 번째 profileUpdated 이벤트 디스패치 완료')
        
        // 약간의 지연 후 다시 확인 (DB 동기화 대기)
        setTimeout(() => {
          console.log('[설정 모달] 두 번째 profileUpdated 이벤트 디스패치 시작')
          window.dispatchEvent(new Event('profileUpdated'))
          console.log('[설정 모달] 두 번째 profileUpdated 이벤트 디스패치 완료')
        }, 500)
        
        console.log('[설정 모달] 모달 닫기 전')
        setIsSaving(false)
        console.log('[설정 모달] setIsSaving(false) 호출됨')
        onClose()
        console.log('[설정 모달] 모달 닫기 완료')
      } else {
        console.warn('[설정 모달] 이름 저장 확인 실패:', {
          updatedProfile,
          expectedName: trimmedName,
          actualName: updatedProfile?.name
        })
        setIsSaving(false)
        toast.error('이름 저장 확인에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('[설정 모달] 이름 변경 오류 (catch 블록)')
      console.error('[설정 모달] 에러 타입:', typeof error)
      console.error('[설정 모달] 에러 객체:', error)
      
      // 에러 메시지 추출 시도
      let errorMessage = '이름 변경에 실패했습니다.'
      
      if (error) {
        if (typeof error === 'string') {
          errorMessage = error
          console.error('[설정 모달] 에러가 문자열:', error)
        } else if (error instanceof Error) {
          errorMessage = error.message || errorMessage
          console.error('[설정 모달] 에러가 Error 인스턴스:', {
            message: error.message,
            stack: error.stack,
            name: error.name
          })
        } else if (error.message) {
          errorMessage = error.message
          console.error('[설정 모달] 에러에 message 속성:', error.message)
        } else if (error.details) {
          errorMessage = error.details
          console.error('[설정 모달] 에러에 details 속성:', error.details)
        } else {
          // 에러 객체의 모든 속성 확인
          console.error('[설정 모달] 에러 객체 속성:', Object.keys(error))
          console.error('[설정 모달] 에러 객체 값:', Object.values(error))
          
          // JSON.stringify 시도
          try {
            const errorStr = JSON.stringify(error, null, 2)
            console.error('[설정 모달] 에러 JSON:', errorStr)
          } catch (jsonError) {
            console.error('[설정 모달] JSON.stringify 실패:', jsonError)
            // 순환 참조 등으로 인한 에러 처리
            try {
              const errorStr = JSON.stringify(error, (key, value) => {
                if (key === 'stack' || key === 'cause') return '[Circular]'
                return value
              }, 2)
              console.error('[설정 모달] 에러 JSON (순환 참조 제거):', errorStr)
            } catch (jsonError2) {
              console.error('[설정 모달] JSON.stringify 재시도 실패:', jsonError2)
            }
          }
        }
      } else {
        console.error('[설정 모달] 에러가 null 또는 undefined')
      }
      
      console.log('[설정 모달] 최종 에러 메시지:', errorMessage)
      setIsSaving(false)
      toast.error(`이름 변경 실패: ${errorMessage}`)
    } finally {
      console.log('[설정 모달] finally 블록 실행')
      console.log('[설정 모달] 현재 isSaving 상태:', isSaving)
      // setIsSaving(false)는 각 경로에서 이미 호출됨
      console.log('[설정 모달] handleSave 종료')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">설정</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="settings-name" className="block text-sm font-medium text-gray-700 mb-1">
              이름
            </label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSaving || isLoading}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder={isLoading ? '로딩 중...' : '이름을 입력하세요'}
              minLength={2}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className={`flex-1 px-4 py-2 text-sm font-semibold rounded-lg transition-all ${
              isSaving || isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}
