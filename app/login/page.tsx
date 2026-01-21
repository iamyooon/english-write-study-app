/**
 * 로그인 페이지
 */

'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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

  // URL 파라미터에서 메시지 확인
  useEffect(() => {
    const message = searchParams.get('message')
    if (message) {
      toast.success(decodeURIComponent(message), {
        duration: 5000,
      })
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      toast.error('이메일과 비밀번호를 입력해주세요.')
      return
    }

    setIsLoading(true)
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      if (data.session) {
        toast.success('로그인 성공!')
        // 헤더에 세션 변경 알림
        window.dispatchEvent(new Event('authStateChanged'))
        // 온보딩 페이지로 이동
        router.push('/onboarding')
      }
    } catch (error: any) {
      console.error('로그인 오류:', error)
      toast.error(error.message || '로그인에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-indigo-50 to-purple-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            로그인
          </h1>
          <p className="text-gray-600 text-sm">
            계정에 로그인하세요
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
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
              placeholder="비밀번호를 입력하세요"
              required
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
            {isLoading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{' '}
            <Link href="/signup" className="text-indigo-600 hover:text-indigo-700 font-medium">
              회원가입
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

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">로딩 중...</div>}>
      <LoginPageContent />
    </Suspense>
  )
}
