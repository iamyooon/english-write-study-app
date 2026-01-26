/**
 * Drag & Drop 미션 생성 API
 * 
 * POST /api/study/generate-drag-drop-mission
 * 
 * 저학년(1-3학년)용 Drag & Drop 미션을 생성합니다.
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const generateDragDropMissionSchema = z.object({
  gradeLevel: z.enum(['elementary_low', 'elementary_high']),
  grade: z.number().min(1).max(3), // 저학년(1-3학년)만 지원
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { gradeLevel, grade } = generateDragDropMissionSchema.parse(body)

    // 사용자 인증 확인
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
    }

    // 프로필 확인
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: '프로필을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 타입 단언 (Supabase 타입 추론 문제 해결)
    const profileData = profile as { energy?: number } | null
    if (!profileData) {
      return NextResponse.json({ error: '프로필을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 에너지 체크 (미션 생성 시 1 에너지 소모)
    const currentEnergy = profileData.energy || 0
    const energyCost = 1

    if (currentEnergy < energyCost) {
      return NextResponse.json(
        {
          error: '에너지가 부족합니다.',
          details: `미션 생성을 위해 ${energyCost} 에너지가 필요합니다. (현재: ${currentEnergy})`,
          currentEnergy,
          requiredEnergy: energyCost,
        },
        { status: 400 }
      )
    }

    // 사용자가 이미 완료한 미션 ID 조회
    const { data: completedMissions } = await supabase
      .from('user_mission_progress')
      .select('mission_id')
      .eq('user_id', user.id)

    const completedMissionIds = (completedMissions as { mission_id: string }[] | null)?.map((m) => m.mission_id) || []

    // DB에서 해당 학년의 drag_drop 타입 미션 조회
    const { data: allMissions, error: missionsError } = await supabase
      .from('missions')
      .select('id, mission_data')
      .eq('mission_type', 'drag_drop')
      .eq('grade_level', gradeLevel)
      .eq('grade', grade)
      .eq('is_active', true)

    if (missionsError) {
      console.error('미션 조회 오류:', missionsError)
      return NextResponse.json(
        { error: '미션을 조회하는 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    // 완료하지 않은 미션만 필터링
    const missions = (allMissions as { id: string; mission_data: any }[] | null)?.filter(
      (mission) => !completedMissionIds.includes(mission.id)
    ) || []

    if (!missions || missions.length === 0) {
      return NextResponse.json(
        { error: '해당 학년의 사용 가능한 미션이 없습니다.' },
        { status: 404 }
      )
    }

    // 랜덤하게 하나 선택
    const randomMission = missions[Math.floor(Math.random() * missions.length)]
    const missionData = randomMission.mission_data as {
      korean?: string
      template?: string
      blanks?: number
      wordOptions?: string[]
      correctAnswers?: string[]
      sentence?: string
      sub_type?: string
    }

    const korean = missionData.korean || missionData.sentence || ''
    const template = missionData.template || ''
    const blanks = missionData.blanks || 1
    const wordOptions = Array.isArray(missionData.wordOptions) ? missionData.wordOptions : []
    const correctAnswers = Array.isArray(missionData.correctAnswers) ? missionData.correctAnswers : []

    if (!korean || !template || wordOptions.length === 0 || correctAnswers.length === 0) {
      return NextResponse.json(
        { error: '미션 데이터가 올바르지 않습니다.' },
        { status: 500 }
      )
    }

    // 빈칸 개수와 정답 개수 일치 확인
    if (correctAnswers.length !== blanks) {
      return NextResponse.json(
        { error: '빈칸 개수와 정답 개수가 일치하지 않습니다.' },
        { status: 500 }
      )
    }

    // 에너지 소모
    const newEnergy = Math.max(0, currentEnergy - energyCost)
    // 타입 단언 (Supabase 타입 추론 문제 해결)
    const updateSupabase = supabase as any
    const { error: updateError } = await updateSupabase
      .from('profiles')
      .update({ energy: newEnergy })
      .eq('id', user.id)

    if (updateError) {
      console.error('에너지 업데이트 실패:', updateError)
      // 에너지 업데이트 실패해도 미션은 반환 (일관성 유지)
    }

    return NextResponse.json({
      success: true,
      mission: {
        id: randomMission.id,
        korean,
        template,
        blanks,
        wordOptions,
        correctAnswers,
        grade,
        subType: missionData.sub_type,
      },
      energy: {
        current: newEnergy,
        consumed: energyCost,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Drag & Drop 미션 생성 오류:', error)

    return NextResponse.json(
      { 
        error: '미션 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
