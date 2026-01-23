/**
 * Drag & Drop 미션 제출 API
 * 저학년용 Level 1 미션 결과 저장
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const submitSchema = z.object({
  missionId: z.string(),
  userAnswer: z.string(),
  fullSentence: z.string(),
  isCorrect: z.boolean(),
  level: z.number().int().min(1).max(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = submitSchema.parse(body)

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    // 프로필 확인
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('energy, placement_level')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError) {
      console.error('프로필 조회 오류:', profileError)
      return NextResponse.json(
        { error: '프로필을 불러오는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 학습 로그 저장
    const { data: studyLog, error: studyLogError } = await (supabase as any)
      .from('study_logs')
      .insert({
        user_id: user.id,
        mission_text: validatedData.fullSentence,
        user_input: validatedData.userAnswer,
        ai_feedback: validatedData.isCorrect
          ? '정답입니다! 잘했어요! 🎉'
          : '다시 시도해보세요! 💪',
        status: validatedData.isCorrect ? 'completed' : 'retry',
        energy_gained: 0, // 에너지 증가 없음 (학습 시 에너지는 감소만 함)
      })
      .select()
      .single()

    if (studyLogError) {
      console.error('학습 로그 저장 오류:', studyLogError)
      return NextResponse.json(
        { error: '학습 로그를 저장하는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 에너지 증가 로직 제거 (학습 시 에너지는 감소만 함)

    // 힌트 생성 (정답/오답 모두)
    const hint = validatedData.isCorrect
      ? '잘했어요! 다음 문장도 같은 실력을 발휘해보세요. 문법과 단어 선택에 주의하면서 작성해보세요.'
      : '다음 문장을 작성할 때는 문법 규칙과 단어의 올바른 사용법을 다시 한번 확인해보세요. 천천히 생각하면서 작성하면 더 좋은 결과를 얻을 수 있어요!'
    
    console.log('[API DragDrop 제출] 응답 전송:', { 
      success: true, 
      isCorrect: validatedData.isCorrect, 
      hasHint: !!hint 
    })
    
    return NextResponse.json({
      success: true,
      studyLog,
      isCorrect: validatedData.isCorrect,
      message: validatedData.isCorrect
        ? '정답입니다! 🎉'
        : '다시 시도해보세요!',
      hint: hint, // 힌트 추가
      score: validatedData.isCorrect ? 100 : 50, // 점수 추가
    })
  } catch (error) {
    console.error('Drag & Drop 제출 오류:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
