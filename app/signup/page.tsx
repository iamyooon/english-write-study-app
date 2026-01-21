/**
 * 회원가입 페이지
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // 로그인 상태 확인 및 리다이렉트
  useEffect(() => {
    const checkSession = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // 이미 로그인되어 있으면 writing 페이지로 리다이렉트
        router.replace('/writing')
      }
    }
    
    checkSession()
  }, [router])

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!name || !email || !password || !confirmPassword) {
      toast.error('모든 필드를 입력해주세요.')
      return
    }

    if (name.trim().length < 2) {
      toast.error('이름은 최소 2자 이상이어야 합니다.')
      return
    }

    if (password !== confirmPassword) {
      toast.error('비밀번호가 일치하지 않습니다.')
      return
    }

    if (password.length < 6) {
      toast.error('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // 프로필에 이름 저장
        console.log('프로필 저장 시도:', { userId: data.user.id, name: name.trim() })
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            name: name.trim(),
          } as any, {
            onConflict: 'id'
          })
          .select()

        console.log('프로필 저장 결과:', { profileData, profileError })

        if (profileError) {
          console.error('프로필 생성 오류:', profileError)
          toast.error(`프로필 저장 실패: ${profileError.message}`)
          // 프로필 생성 실패해도 계속 진행
        } else {
          console.log('프로필 저장 성공:', profileData)
        }

        // 이메일 인증이 필요한 경우
        if (!data.session) {
          toast.success('회원가입이 완료되었습니다! 이메일을 확인해주세요.', {
            duration: 5000,
          })
          router.push('/login?message=이메일 인증 링크를 확인해주세요.')
          return
        }
        
        // 세션이 있으면 바로 온보딩으로 이동
        toast.success('회원가입 성공!')
        // 헤더에 세션 변경 알림
        window.dispatchEvent(new Event('authStateChanged'))
        router.push('/onboarding')
      }
    } catch (error: any) {
      console.error('회원가입 오류:', error)
      toast.error(error.message || '회원가입에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            회원가입
          </h1>
          <p className="text-gray-600 text-sm">
            새 계정을 만드세요
          </p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              이름
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="이름을 입력하세요"
              required
              minLength={2}
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              이메일
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="이메일을 입력하세요"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="비밀번호를 입력하세요 (최소 6자)"
              required
              minLength={6}
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              비밀번호 확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="비밀번호를 다시 입력하세요"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-6 py-3 rounded-lg font-semibold transition-all ${
              isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-xl'
            }`}
          >
            {isLoading ? '가입 중...' : '회원가입'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
              로그인
            </Link>
          </p>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <Link
            href="/"
            className="block text-center text-sm text-gray-500 hover:text-gray-700"
          >
            ← 홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  )
}
