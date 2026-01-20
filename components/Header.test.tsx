/**
 * Header 컴포넌트 테스트
 * 인증 상태, 프로필 조회, 세션 처리 로직 검증
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Header from './Header'
import { createClient } from '@/lib/supabase/client'

// Supabase 클라이언트 모킹
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(),
}))

// Next.js 라우터 모킹
const mockPush = vi.fn()
const mockReplace = vi.fn()
const mockPathname = '/'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => mockPathname,
  Link: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

// react-hot-toast 모킹
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// SettingsModal 모킹
vi.mock('./SettingsModal', () => ({
  default: ({ isOpen, onClose, userId }: { isOpen: boolean; onClose: () => void; userId: string | null }) => (
    isOpen ? <div data-testid="settings-modal">Settings Modal (userId: {userId})</div> : null
  ),
}))

describe('Header', () => {
  const mockSupabaseClient = {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } },
      })),
      signOut: vi.fn(),
    },
    from: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(createClient).mockReturnValue(mockSupabaseClient as any)
    
    // 기본 fetch 모킹
    global.fetch = vi.fn()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('초기 렌더링', () => {
    it('비로그인 상태에서 로그인/회원가입 링크가 표시된다', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null,
      })

      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      })

      render(<Header />)

      await waitFor(() => {
        expect(screen.getByText(/로그인/i)).toBeInTheDocument()
        expect(screen.getByText(/회원가입/i)).toBeInTheDocument()
      })
    })

    it('로그인 상태에서 사용자 정보가 표시된다', async () => {
      const mockSession = {
        user: { id: 'test-user-id' },
        access_token: 'test-access-token',
      }

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      // 프로필 조회 모킹
      const mockProfileQuery = {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        maybeSingle: vi.fn().mockResolvedValue({
          data: { energy: 100, name: '테스트 사용자' },
          error: null,
        }),
      }
      mockSupabaseClient.from.mockReturnValue(mockProfileQuery as any)

      // REST API fetch 모킹
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => [{ energy: 100, name: '테스트 사용자' }],
      } as Response)

      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        // INITIAL_SESSION 이벤트 시뮬레이션
        setTimeout(() => {
          callback('INITIAL_SESSION', mockSession)
        }, 0)
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        }
      })

      render(<Header />)

      await waitFor(() => {
        expect(screen.getByText(/테스트 사용자님/i)).toBeInTheDocument()
      }, { timeout: 3000 })
    })
  })

  describe('프로필 조회', () => {
    it('accessToken이 있을 때 REST API로 프로필을 조회한다', async () => {
      const mockSession = {
        user: { id: 'test-user-id' },
        access_token: 'test-access-token',
      }

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => [{ energy: 50, name: 'REST API 사용자' }],
      } as Response)

      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        setTimeout(() => {
          callback('SIGNED_IN', mockSession)
        }, 0)
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        }
      })

      render(<Header />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
        const fetchCall = vi.mocked(global.fetch).mock.calls[0]
        expect(fetchCall[0]).toContain('/rest/v1/profiles')
        expect(fetchCall[1]?.headers).toMatchObject({
          'Authorization': 'Bearer test-access-token',
        })
      }, { timeout: 3000 })
    })

    it('프로필이 없을 때 기본값을 설정한다', async () => {
      const mockSession = {
        user: { id: 'test-user-id' },
        access_token: 'test-access-token',
      }

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      // 빈 배열 반환 (프로필 없음)
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response)

      // 프로필 생성 모킹
      const mockInsert = {
        select: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: { id: 'test-user-id', energy: 100, name: null },
          error: null,
        }),
      }
      const mockFromInsert = {
        insert: vi.fn().mockReturnValue(mockInsert),
      }
      mockSupabaseClient.from.mockReturnValue(mockFromInsert as any)

      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        setTimeout(() => {
          callback('SIGNED_IN', mockSession)
        }, 0)
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        }
      })

      render(<Header />)

      await waitFor(() => {
        expect(mockSupabaseClient.from).toHaveBeenCalledWith('profiles')
      }, { timeout: 3000 })
    })
  })

  describe('세션 처리', () => {
    it('새로고침 시 세션이 복구되면 프로필을 조회한다', async () => {
      const mockSession = {
        user: { id: 'test-user-id' },
        access_token: 'test-access-token',
      }

      // 첫 번째 호출: 세션 없음 (초기 로드)
      // 두 번째 호출: 세션 있음 (복구 후)
      let callCount = 0
      mockSupabaseClient.auth.getSession.mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return Promise.resolve({ data: { session: null }, error: null })
        }
        return Promise.resolve({ data: { session: mockSession }, error: null })
      })

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        json: async () => [{ energy: 75, name: '복구된 사용자' }],
      } as Response)

      mockSupabaseClient.auth.onAuthStateChange.mockImplementation((callback) => {
        // INITIAL_SESSION 이벤트 시뮬레이션
        setTimeout(() => {
          callback('INITIAL_SESSION', null)
        }, 100)
        // 세션 복구 시뮬레이션
        setTimeout(() => {
          callback('SIGNED_IN', mockSession)
        }, 200)
        return {
          data: { subscription: { unsubscribe: vi.fn() } },
        }
      })

      render(<Header />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled()
      }, { timeout: 3000 })
    })
  })

  describe('이벤트 처리', () => {
    it('profileUpdated 이벤트를 받으면 프로필을 다시 조회한다', async () => {
      const mockSession = {
        user: { id: 'test-user-id' },
        access_token: 'test-access-token',
      }

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null,
      })

      let fetchCallCount = 0
      vi.mocked(global.fetch).mockImplementation(() => {
        fetchCallCount++
        return Promise.resolve({
          ok: true,
          json: async () => [{ energy: 100, name: `사용자 ${fetchCallCount}` }],
        } as Response)
      })

      mockSupabaseClient.auth.onAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      })

      render(<Header />)

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(1)
      })

      // profileUpdated 이벤트 발생
      window.dispatchEvent(new Event('profileUpdated'))

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledTimes(2)
      }, { timeout: 2000 })
    })
  })
})
