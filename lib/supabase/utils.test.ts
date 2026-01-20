/**
 * Supabase 유틸리티 함수 테스트
 * 
 * 에너지 시스템 관련 함수들의 유닛 테스트
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  consumeEnergy,
  produceEnergy,
  chargeEnergyDaily,
  getUsersNeedingEnergyCharge,
} from './utils'

// Supabase 클라이언트 모킹
vi.mock('./server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          or: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(),
          })),
        })),
      })),
    })),
  })),
}))

describe('Energy System Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('consumeEnergy', () => {
    it('should consume energy successfully when sufficient energy available', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { energy: 100 },
                error: null,
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { energy: 0 },
                  error: null,
                }),
              })),
            })),
          })),
        })),
      }

      const { createClient } = await import('./server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const result = await consumeEnergy('user-123', 100)
      expect(result.energy).toBe(0)
    })

    it('should throw error when insufficient energy', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { energy: 50 },
                error: null,
              }),
            })),
          })),
        })),
      }

      const { createClient } = await import('./server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      await expect(consumeEnergy('user-123', 100)).rejects.toThrow(
        'Insufficient energy'
      )
    })
  })

  describe('produceEnergy', () => {
    it('should produce energy successfully (capped at 100)', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { energy: 95 },
                error: null,
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { energy: 100 },
                  error: null,
                }),
              })),
            })),
          })),
        })),
      }

      const { createClient } = await import('./server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const result = await produceEnergy('user-123', 10)
      expect(result.energy).toBe(100)
    })

    it('should not exceed max energy of 100', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { energy: 99 },
                error: null,
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { energy: 100 },
                  error: null,
                }),
              })),
            })),
          })),
        })),
      }

      const { createClient } = await import('./server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const result = await produceEnergy('user-123', 10)
      expect(result.energy).toBeLessThanOrEqual(100)
    })
  })

  describe('chargeEnergyDaily', () => {
    it('should charge energy to 100', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn().mockResolvedValue({
                  data: { energy: 100, energy_last_charged: new Date().toISOString() },
                  error: null,
                }),
              })),
            })),
          })),
        })),
      }

      const { createClient } = await import('./server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const result = await chargeEnergyDaily('user-123')
      expect(result.energy).toBe(100)
      expect(result.energy_last_charged).toBeDefined()
    })
  })

  describe('getUsersNeedingEnergyCharge', () => {
    it('should return users who need energy charge', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            or: vi.fn().mockResolvedValue({
              data: [
                { id: 'user-1', energy_last_charged: null },
                { id: 'user-2', energy_last_charged: '2024-01-01T00:00:00Z' },
              ],
              error: null,
            }),
          })),
        })),
      }

      const { createClient } = await import('./server')
      vi.mocked(createClient).mockResolvedValue(mockSupabase as any)

      const result = await getUsersNeedingEnergyCharge()
      expect(result).toContain('user-1')
      expect(result).toContain('user-2')
    })
  })
})
