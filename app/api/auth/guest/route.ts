/**
 * 게스트 모드 인증 API
 * 
 * POST /api/auth/guest
 * 
 * 익명 계정을 생성하고 세션을 반환합니다.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const guestRequestSchema = z.object({
  gradeLevel: z.enum(['elementary_low', 'elementary_high']).optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { gradeLevel } = guestRequestSchema.parse(body)

    // 환경 변수 확인
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('⚠️ Supabase 환경 변수가 설정되지 않았습니다.')
      return NextResponse.json(
        { 
          error: 'Supabase 환경 변수가 설정되지 않았습니다.',
          details: '.env.local 파일에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정해주세요.'
        },
        { status: 500 }
      )
    }

    const supabase = await createClient()

    // 익명 사용자 생성 (Supabase Auth)
    // 참고: Supabase 대시보드에서 익명 인증이 활성화되어 있어야 합니다
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously()

    if (authError) {
      console.error('게스트 인증 실패:', authError)
      
      // 익명 인증이 비활성화된 경우를 위한 상세 에러 메시지
      if (authError.message?.includes('anonymous') || authError.message?.includes('disabled')) {
        return NextResponse.json(
          { 
            error: '익명 인증이 비활성화되어 있습니다. Supabase 대시보드에서 익명 인증을 활성화해주세요.',
            details: authError.message 
          },
          { status: 500 }
        )
      }
      
      return NextResponse.json(
        { 
          error: '게스트 계정 생성에 실패했습니다.',
          details: authError.message 
        },
        { status: 500 }
      )
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: '사용자 정보를 가져올 수 없습니다.' },
        { status: 500 }
      )
    }

    const userId = authData.user.id

    // 프로필 생성 또는 업데이트
    // 참고: 실제 스키마에 맞춰 grade 필드 사용 (grade_level 아님)
    const profileData: any = {
      id: userId,
      level: 1,
      energy: 100, // 에너지 시스템: 기본값 100
      gems: 0,
      is_premium: false,
      vision_usage_today: 0,
      feedback_usage_today: 0,
      energy_last_charged: new Date().toISOString(), // 에너지 시스템: 충전 시점 기록
    }

    if (gradeLevel) {
      // grade 필드에 학년 저장 (1-3: 저학년, 4-6: 고학년)
      profileData.grade = gradeLevel === 'elementary_low' ? 1 : 4
      // publisher는 나중에 설정 가능
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'id',
      })
      .select()
      .single()

    if (profileError) {
      console.error('프로필 생성 실패:', profileError)
      // RLS 정책 문제일 수 있으므로 상세 에러 정보 반환
      if (profileError.code === '42501' || profileError.message?.includes('policy')) {
        return NextResponse.json(
          {
            error: '프로필 생성 권한이 없습니다.',
            details: 'Supabase RLS 정책을 확인해주세요. profiles 테이블에 INSERT 정책이 필요합니다.',
            profileError: profileError.message,
          },
          { status: 403 }
        )
      }
      // 다른 에러는 인증은 성공했으므로 계속 진행
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userId,
        isAnonymous: true,
      },
      profile: profile || null,
      session: authData.session,
      profileError: profileError ? profileError.message : null,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: error.errors },
        { status: 400 }
      )
    }

    console.error('게스트 인증 오류:', error)
    
    // 더 구체적인 에러 메시지 제공
    let errorMessage = '서버 오류가 발생했습니다.'
    let errorDetails = error instanceof Error ? error.message : String(error)
    
    // JSON 파싱 오류
    if (error instanceof SyntaxError) {
      errorMessage = '요청 데이터 형식이 올바르지 않습니다.'
    }
    
    // 환경 변수 관련 오류
    if (errorDetails.includes('URL') || errorDetails.includes('KEY')) {
      errorMessage = 'Supabase 환경 변수가 설정되지 않았습니다.'
      errorDetails = '.env.local 파일에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정해주세요.'
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    )
  }
}
