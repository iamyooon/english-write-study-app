/**
 * 공통 헤더 컴포넌트
 * 로그인/로그아웃, 프로필, 에너지 정보 표시
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'
import SettingsModal from './SettingsModal'

export default function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState<string | null>(null)
  const [energy, setEnergy] = useState<number>(5)
  const [isLoading, setIsLoading] = useState(true)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const isLoggedInRef = useRef(false)
  const userNameRef = useRef<string | null>(null)

  // 헤더를 숨길 경로들
  const hideHeaderPaths = ['/login', '/signup']
  const shouldHideHeader = hideHeaderPaths.includes(pathname)

  // 프로필 정보 가져오기 함수
  const fetchProfile = async (userId: string, silent = false, accessToken?: string) => {
    if (!silent) {
      console.log('[헤더] fetchProfile 시작:', userId, { hasAccessToken: !!accessToken })
    }
    
    try {
      // accessToken이 있으면 REST API 직접 호출 (새로고침 시 Supabase 클라이언트 초기화 문제 회피)
      if (accessToken) {
        if (!silent) {
          console.log('[헤더] REST API 직접 호출로 프로필 조회 시작')
        }
        
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!supabaseUrl || !supabaseKey) {
          console.error('[헤더] Supabase 환경 변수가 없음')
          throw new Error('Supabase 환경 변수가 설정되지 않았습니다')
        }
        
        const restUrl = `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=energy,name`
        
        try {
          const fetchStartTime = Date.now()
          const fetchResponse = await fetch(restUrl, {
            method: 'GET',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation',
            },
          })
          const fetchEndTime = Date.now()
          
          if (!silent) {
            console.log('[헤더] REST API 응답:', {
              status: fetchResponse.status,
              statusText: fetchResponse.statusText,
              duration: `${fetchEndTime - fetchStartTime}ms`,
              ok: fetchResponse.ok,
            })
          }
          
          if (fetchResponse.ok) {
            const data = await fetchResponse.json()
            if (Array.isArray(data) && data.length > 0) {
              const profile = data[0]
              if (!silent) {
                console.log('[헤더] REST API로 프로필 조회 성공:', profile)
              }
              
              // 프로필 데이터 처리
              if (profile.energy !== undefined && profile.energy !== null) {
                setEnergy(profile.energy)
              } else {
                setEnergy(100)
              }
              
              if (profile.name && profile.name.trim()) {
                const trimmedName = profile.name.trim()
                setUserName(trimmedName)
                userNameRef.current = trimmedName
              } else {
                setUserName(null)
                userNameRef.current = null
              }
              
              return // 성공적으로 완료
            } else {
              if (!silent) {
                console.log('[헤더] REST API로 프로필 없음 (빈 배열)')
              }
              // 프로필이 없으면 생성
              const supabase = createClient()
              // 타입 단언 (Supabase 타입 추론 문제 해결)
              const insertSupabase = supabase as any
              const { data: newProfile, error: createError } = await insertSupabase
                .from('profiles')
                .insert({
                  id: userId,
                  energy: 100,
                  name: null
                })
                .select()
                .single()
              
              if (createError) {
                console.error('프로필 생성 실패:', createError)
                setEnergy(100)
                return
              }
              
              setEnergy(100)
              setUserName(null)
              userNameRef.current = null
              return
            }
          } else {
            const errorText = await fetchResponse.text()
            console.error('[헤더] REST API 에러:', {
              status: fetchResponse.status,
              statusText: fetchResponse.statusText,
              errorText,
            })
            throw new Error(`REST API 에러: ${fetchResponse.status} ${fetchResponse.statusText}`)
          }
        } catch (directFetchError) {
          console.error('[헤더] REST API 직접 호출 실패:', directFetchError)
          // REST API 실패 시 Supabase 클라이언트로 폴백
          if (!silent) {
            console.log('[헤더] Supabase 클라이언트로 폴백')
          }
        }
      }
      
      // Supabase 클라이언트 사용 (accessToken이 없거나 REST API 실패 시)
      const supabase = createClient()
      
      if (!silent) {
        console.log('[헤더] 프로필 조회 시작 (Supabase 클라이언트)')
      }
      
      const queryBuilder = supabase
        .from('profiles')
        .select('energy, name')
        .eq('id', userId)
      
      // 타임아웃 설정 (5초)
      let timeoutId: NodeJS.Timeout | null = null
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => {
          console.warn('[헤더] 프로필 조회 타임아웃 (5초)')
          reject(new Error('프로필 조회 타임아웃'))
        }, 5000)
      })
      
      const profilePromise = queryBuilder.maybeSingle()
      
      let profile: any = null
      let error: any = null
      
      try {
        if (!silent) {
          console.log('[헤더] Promise.race 시작 (프로필 조회 vs 타임아웃)')
        }
        const startTime = Date.now()
        const result = await Promise.race([profilePromise, timeoutPromise]) as any
        const endTime = Date.now()
        
        // 타임아웃 취소 (Promise.race가 완료되었으므로)
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
        }
        
        if (!silent) {
          console.log('[헤더] 프로필 조회 완료:', {
            duration: `${endTime - startTime}ms`,
            hasData: !!result?.data,
            hasError: !!result?.error,
            userId,
          })
        }
        
        profile = result?.data || null
        error = result?.error || null
      } catch (timeoutError) {
        // 타임아웃이 발생한 경우에도 타임아웃 ID 정리
        if (timeoutId) {
          clearTimeout(timeoutId)
          timeoutId = null
          console.log('[헤더] 타임아웃 취소됨 (타임아웃 에러 발생)')
        }
        
        console.warn('[헤더] 프로필 조회 타임아웃 발생:', timeoutError)
        console.log('[헤더] 타임아웃 에러 상세:', {
          errorType: typeof timeoutError,
          errorMessage: timeoutError instanceof Error ? timeoutError.message : String(timeoutError),
          errorStack: timeoutError instanceof Error ? timeoutError.stack : undefined,
        })
        
        // 네트워크 요청이 실제로 발생했는지 확인
        console.log('[헤더] 네트워크 요청 확인을 위해 fetch 직접 시도')
        try {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
          
          if (!supabaseUrl || !supabaseKey) {
            console.error('[헤더] Supabase 환경 변수가 없음:', {
              hasUrl: !!supabaseUrl,
              hasKey: !!supabaseKey,
            })
            throw new Error('Supabase 환경 변수가 설정되지 않았습니다')
          }
          
          // 세션 토큰 가져오기
          console.log('[헤더] 세션 토큰 조회 시작')
          const { data: { session: currentSession } } = await supabase.auth.getSession()
          const sessionToken = currentSession?.access_token
          console.log('[헤더] 세션 토큰 조회 완료:', {
            hasSession: !!currentSession,
            hasToken: !!sessionToken,
            tokenPrefix: sessionToken ? sessionToken.substring(0, 20) + '...' : null,
          })
          
          // 직접 REST API 호출 시도
          const restUrl = `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=energy,name`
          console.log('[헤더] REST API 직접 호출 시도:', restUrl.substring(0, 50) + '...')
          
          const fetchStartTime = Date.now()
          const fetchResponse = await fetch(restUrl, {
            method: 'GET',
            headers: {
              'apikey': supabaseKey,
              'Authorization': sessionToken ? `Bearer ${sessionToken}` : `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation',
            },
          })
          const fetchEndTime = Date.now()
          
          console.log('[헤더] REST API 응답:', {
            status: fetchResponse.status,
            statusText: fetchResponse.statusText,
            duration: `${fetchEndTime - fetchStartTime}ms`,
            ok: fetchResponse.ok,
          })
          
          if (fetchResponse.ok) {
            const data = await fetchResponse.json()
            console.log('[헤더] REST API 데이터:', data)
            if (Array.isArray(data) && data.length > 0) {
              profile = data[0]
              console.log('[헤더] REST API로 프로필 조회 성공:', profile)
            } else {
              console.log('[헤더] REST API로 프로필 없음 (빈 배열)')
              profile = null
            }
          } else {
            const errorText = await fetchResponse.text()
            console.error('[헤더] REST API 에러:', {
              status: fetchResponse.status,
              statusText: fetchResponse.statusText,
              errorText,
            })
            throw new Error(`REST API 에러: ${fetchResponse.status} ${fetchResponse.statusText}`)
          }
        } catch (directFetchError) {
          console.error('[헤더] REST API 직접 호출 실패:', directFetchError)
          // 재시도 실패 시 기본값 설정하고 종료
          setEnergy(100)
          setUserName(null)
          userNameRef.current = null
          console.log('[헤더] 프로필 조회 실패로 기본값 설정 완료')
          return
        }
      }

      console.log('[헤더] 프로필 조회 결과:', { profile, error, userId })

      if (error) {
        // RLS 정책 등 다른 에러인 경우
        console.warn('프로필 로드 실패:', error.message, error.code)
        setEnergy(100)
        return
      }

      if (!profile) {
        // 프로필이 없으면 생성
        console.log('프로필이 없어서 생성 시도')
        // 타입 단언 (Supabase 타입 추론 문제 해결)
        const insertSupabase = supabase as any
        const { data: newProfile, error: createError } = await insertSupabase
          .from('profiles')
          .insert({
            id: userId,
            energy: 100,
            name: null
          })
          .select()
          .single()

        if (createError) {
          console.error('프로필 생성 실패:', createError)
          setEnergy(100)
          return
        }

        console.log('프로필 생성 완료:', newProfile)
        setEnergy(100)
        setUserName(null)
        return
      }

      // 프로필이 있는 경우
      if (!silent) {
        console.log('[헤더] 프로필 데이터:', profile)
      }
      
      if (profile.energy !== undefined && profile.energy !== null) {
        if (!silent) {
          console.log('[헤더] 에너지 설정:', profile.energy)
        }
        setEnergy(profile.energy)
      } else {
        if (!silent) {
          console.log('[헤더] 에너지 없음, 기본값 100 설정')
        }
        setEnergy(100)
      }
      
      // 이름이 있으면 설정
      if (profile.name && profile.name.trim()) {
        const trimmedName = profile.name.trim()
        if (!silent) {
          console.log('[헤더] 이름 설정:', trimmedName)
        }
        setUserName(trimmedName)
        userNameRef.current = trimmedName
      } else {
        if (!silent) {
          console.log('[헤더] 이름이 없음:', profile.name, '- 기본값 "사용자"로 표시됨')
        }
        // 이름이 없으면 null로 설정 (헤더에서 "사용자"로 표시됨)
        setUserName(null)
        userNameRef.current = null
      }
      
      if (!silent) {
        console.log('[헤더] fetchProfile 완료:', { 
          userName: userNameRef.current, 
          energy: profile.energy !== undefined && profile.energy !== null ? profile.energy : 100 
        })
      }
    } catch (error) {
      console.error('프로필 가져오기 오류:', error)
      setEnergy(5)
    }
  }

  useEffect(() => {
    let isMounted = true
    
    const checkSession = async () => {
      try {
        const supabase = createClient()
        
        // 세션 확인 (타임아웃 제거 - 완료될 때까지 기다림)
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('초기 세션 확인:', { 
          hasSession: !!session, 
          userId: session?.user?.id,
          error 
        })

        if (!isMounted) return

        // 로딩 상태 해제
        setIsLoading(false)

        if (session && !error) {
          console.log('[헤더] checkSession에서 세션 확인됨, 프로필 로드 시작:', session.user.id)
          setIsLoggedIn(true)
          isLoggedInRef.current = true
          setCurrentUserId(session.user.id)
          // 프로필은 비동기로 가져오기
          fetchProfile(session.user.id).catch(err => {
            console.error('[헤더] checkSession에서 프로필 로드 실패:', err)
          })
        } else {
          setIsLoggedIn(false)
          isLoggedInRef.current = false
          setCurrentUserId(null)
          setUserName(null)
          userNameRef.current = null
          setEnergy(100)
        }
      } catch (error) {
        console.error('세션 확인 오류:', error)
        if (isMounted) {
          setIsLoading(false)
          // 에러 발생 시에도 세션을 다시 확인
          const supabase = createClient()
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (isMounted) {
              if (session) {
                setIsLoggedIn(true)
                isLoggedInRef.current = true
                fetchProfile(session.user.id).catch(err => {
                  console.warn('재시도 프로필 로드 실패:', err)
                })
              } else {
                setIsLoggedIn(false)
                isLoggedInRef.current = false
                setUserName(null)
                userNameRef.current = null
                setEnergy(100)
              }
            }
          })
        }
      }
    }

    // 즉시 로딩 해제 (최대 200ms 후)
    const immediateTimeout = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false)
      }
    }, 200)

    checkSession()

    // 세션 변경 감지
    const supabase = createClient()
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return
      
      console.log('Auth state changed:', event, session?.user?.id)
      
      // INITIAL_SESSION 이벤트는 초기 로드 시 발생
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          console.log('[헤더] onAuthStateChange에서 세션 확인됨, 프로필 로드 시작:', session.user.id)
          setIsLoggedIn(true)
          isLoggedInRef.current = true
          setCurrentUserId(session.user.id)
          setIsLoading(false)
          // 프로필 즉시 가져오기 (accessToken 전달)
          try {
            await fetchProfile(session.user.id, false, session.access_token)
            console.log('[헤더] onAuthStateChange에서 프로필 로드 완료')
          } catch (profileError) {
            console.error('[헤더] onAuthStateChange에서 프로필 로드 실패:', profileError)
          }
        } else {
          setIsLoggedIn(false)
          isLoggedInRef.current = false
          setCurrentUserId(null)
          setIsLoading(false)
          setUserName(null)
          userNameRef.current = null
          setEnergy(5)
        }
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false)
        setCurrentUserId(null)
        isLoggedInRef.current = false
        setUserName(null)
        userNameRef.current = null
        setEnergy(5)
      }
    })

    // 에너지 업데이트 이벤트 리스너
    const handleEnergyUpdate = () => {
      if (!isMounted || !isLoggedInRef.current) return
      
      const supabase = createClient()
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && isMounted && isLoggedInRef.current) {
          fetchProfile(session.user.id).catch(err => {
            console.warn('에너지 업데이트 시 프로필 조회 실패:', err)
          })
        }
      }).catch(err => {
        console.warn('에너지 업데이트 시 세션 확인 실패:', err)
      })
    }

    // 프로필 업데이트 이벤트 리스너
    const handleProfileUpdate = () => {
      if (!isMounted || !isLoggedInRef.current) return
      
      const supabase = createClient()
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && isMounted && isLoggedInRef.current) {
          fetchProfile(session.user.id).catch(err => {
            console.warn('프로필 업데이트 시 프로필 조회 실패:', err)
          })
        }
      }).catch(err => {
        console.warn('프로필 업데이트 시 세션 확인 실패:', err)
      })
    }

    // 인증 상태 변경 이벤트 리스너
    const handleAuthStateChanged = async () => {
      if (!isMounted) return
      
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        setIsLoggedIn(true)
        isLoggedInRef.current = true
        await fetchProfile(session.user.id)
      } else {
        setIsLoggedIn(false)
        isLoggedInRef.current = false
        setUserName(null)
        userNameRef.current = null
        setEnergy(5)
      }
    }

    // 커스텀 이벤트 리스너 추가
    window.addEventListener('energyUpdated', handleEnergyUpdate)
    window.addEventListener('profileUpdated', handleProfileUpdate)
    window.addEventListener('authStateChanged', handleAuthStateChanged)

    return () => {
      isMounted = false
      clearTimeout(immediateTimeout)
      subscription.unsubscribe()
      window.removeEventListener('energyUpdated', handleEnergyUpdate)
      window.removeEventListener('profileUpdated', handleProfileUpdate)
      window.removeEventListener('authStateChanged', handleAuthStateChanged)
    }
  }, [])

  const handleLogout = async () => {
    console.log('[헤더] 로그아웃 시작')
    try {
      console.log('[헤더] 로그아웃 API 호출')
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      console.log('[헤더] 로그아웃 API 응답:', { ok: response.ok, status: response.status })

      if (response.ok) {
        console.log('[헤더] 로그아웃 성공, 상태 초기화 시작')
        // 상태 초기화
        setIsLoggedIn(false)
        isLoggedInRef.current = false
        setUserName(null)
        userNameRef.current = null
        setEnergy(100)
        
        console.log('[헤더] 상태 초기화 완료, 홈페이지로 리다이렉트')
        
        // 헤더에 세션 변경 알림
        window.dispatchEvent(new Event('authStateChanged'))
        
        toast.success('로그아웃되었습니다.')
        
        // 홈페이지로 리다이렉트 (즉시)
        router.replace('/')
        console.log('[헤더] router.replace 호출 완료')
        
        // 추가 안전장치: window.location으로 강제 이동
        setTimeout(() => {
          console.log('[헤더] window.location으로 강제 이동')
          window.location.href = '/'
        }, 100)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('[헤더] 로그아웃 API 실패:', errorData)
        throw new Error(errorData.error || '로그아웃에 실패했습니다.')
      }
    } catch (error: any) {
      console.error('[헤더] 로그아웃 오류:', error)
      toast.error(error.message || '로그아웃에 실패했습니다.')
      // 에러 발생 시에도 홈페이지로 이동
      router.replace('/')
    }
  }

  // 특정 경로에서는 헤더 숨김
  if (shouldHideHeader) {
    return null
  }

  if (isLoading) {
    return (
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* 로고/홈 링크 */}
          <Link 
            href={isLoggedIn ? '/writing' : '/'} 
            className="flex items-center gap-2"
          >
            <h1 className="text-xl font-bold text-indigo-600">
              We Word Planet
            </h1>
          </Link>

          {/* 우측 메뉴 */}
          <div className="flex items-center gap-4">
            {isLoggedIn ? (
              <>
                {/* 에너지 표시 */}
                <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg px-3 py-1.5">
                  <span className="text-lg">⚡</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-orange-600">
                      {energy}/100
                    </span>
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-300"
                        style={{ width: `${(energy / 100) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* 프로필 정보 및 설정 */}
                <div className="flex items-center gap-3">
                  <div className="text-sm font-medium text-gray-700 hidden sm:block">
                    {userName ? `${userName}님` : '사용자'}
                  </div>
                  
                  {/* 설정 버튼 */}
                  <button
                    onClick={() => setIsSettingsOpen(true)}
                    className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                    title="설정"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </button>

                  {/* 로그아웃 버튼 */}
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all"
                  >
                    로그아웃
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* 로그인/회원가입 버튼 */}
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-all"
                >
                  로그인
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-all"
                >
                  회원가입
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 설정 모달 */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        userId={currentUserId}
      />
    </header>
  )
}
