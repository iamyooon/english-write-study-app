/**
 * 자정 에너지 자동 충전 API
 * 
 * GET /api/energy/charge-daily
 * 
 * 자정 이후에 실행하여 에너지가 부족한 사용자들의 에너지를 매일 5씩 충전합니다.
 * Vercel Cron Job에서 매일 자정(UTC)에 자동으로 호출됩니다.
 * 
 * Cron 설정: vercel.json의 crons 설정 참조
 */

import { createClient } from '@/lib/supabase/server'
import { getUsersNeedingEnergyCharge, chargeEnergyDaily } from '@/lib/supabase/utils'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Vercel Cron Job 인증 확인
    // Vercel Cron Job은 자동으로 authorization 헤더를 추가합니다
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET
    
    // CRON_SECRET이 설정되어 있으면 검증, 없으면 Vercel Cron Job 자체 인증 사용
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    console.log('[에너지 충전] Cron Job 실행 시작:', new Date().toISOString())

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
