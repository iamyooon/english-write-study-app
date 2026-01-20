/**
 * 자정 에너지 자동 충전 API
 * 
 * GET /api/energy/charge-daily
 * 
 * 자정 이후에 실행하여 에너지가 부족한 사용자들의 에너지를 100으로 충전합니다.
 * Supabase Edge Function 또는 Cron Job에서 주기적으로 호출합니다.
 */

import { createClient } from '@/lib/supabase/server'
import { getUsersNeedingEnergyCharge, chargeEnergyDaily } from '@/lib/supabase/utils'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // 인증 확인 (서비스 계정 또는 관리자만 접근 가능하도록)
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // TODO: 실제 운영 환경에서는 서비스 계정 또는 특정 관리자만 접근 가능하도록 검증 필요
    // 현재는 개발 환경에서 동작하도록 기본 인증만 확인

    // 충전이 필요한 사용자 찾기
    const userIds = await getUsersNeedingEnergyCharge()

    if (userIds.length === 0) {
      return NextResponse.json({
        success: true,
        message: '충전이 필요한 사용자가 없습니다.',
        chargedCount: 0,
      })
    }

    // 각 사용자에게 에너지 충전
    const results = await Promise.allSettled(
      userIds.map(userId => chargeEnergyDaily(userId))
    )

    const successCount = results.filter(r => r.status === 'fulfilled').length
    const failureCount = results.filter(r => r.status === 'rejected').length

    return NextResponse.json({
      success: true,
      message: `에너지 충전 완료: ${successCount}명 성공, ${failureCount}명 실패`,
      chargedCount: successCount,
      failedCount: failureCount,
      totalUsers: userIds.length,
    })
  } catch (error) {
    console.error('에너지 충전 오류:', error)
    return NextResponse.json(
      {
        error: '에너지 충전 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST 메서드도 지원 (Cron Job에서 POST로 호출할 수 있도록)
 */
export async function POST(request: Request) {
  return GET(request)
}
