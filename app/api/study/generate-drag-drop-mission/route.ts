/**
 * Drag & Drop 미션 생성 API
 * 
 * POST /api/study/generate-drag-drop-mission
 * 
 * 레벨 1~2용 Drag & Drop 미션을 생성합니다.
 */

import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const generateDragDropMissionSchema = z.object({
  gradeLevel: z.enum(['elementary_low', 'elementary_high']),
  level: z.number().min(1).max(2).default(1), // 레벨 1~2만 지원
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { gradeLevel, level } = generateDragDropMissionSchema.parse(body)

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

    // 수준에 맞는 프롬프트 생성
    const levelDescription =
      gradeLevel === 'elementary_low'
        ? '초등학교 저학년(1-3학년) 수준의 매우 간단한 문장'
        : '초등학교 고학년(4-6학년) 수준의 간단한 문장'

    const prompt = `다음 조건에 맞는 Drag & Drop 미션을 생성해주세요:
- 대상: ${levelDescription}
- 난이도 레벨: ${level}/2
- 주제: 일상생활, 가족, 학교, 취미 등 초등학생에게 친숙한 주제
- 문장 길이: ${gradeLevel === 'elementary_low' ? '3-5단어' : '4-6단어'}
- 빈칸 개수: 1개 (레벨 1) 또는 2개 (레벨 2)

다음 JSON 형식으로 응답해주세요:
{
  "korean": "한글 미션 문장",
  "template": "영어 문장 템플릿 (빈칸은 ___로 표시)",
  "blanks": 빈칸_개수,
  "wordOptions": ["선택지1", "선택지2", "선택지3", "선택지4"],
  "correctAnswers": ["정답1", "정답2"]
}

- korean: 한글 미션 문장 (예: "오늘 좋아하는 과일은?")
- template: 영어 문장 템플릿, 빈칸은 ___로 표시 (예: "I like ___ today.")
- blanks: 빈칸 개수 (1 또는 2)
- wordOptions: 선택 가능한 단어 목록 (4-6개, 정답 포함 + 오답 2-4개)
- correctAnswers: 정답 배열 (빈칸 순서대로)

예시:
- 레벨 1: {"korean": "나는 사과를 좋아해요", "template": "I like ___", "blanks": 1, "wordOptions": ["apple", "banana", "orange", "grape"], "correctAnswers": ["apple"]}
- 레벨 2: {"korean": "나는 매일 학교에 가요", "template": "I go to ___ every ___", "blanks": 2, "wordOptions": ["school", "home", "day", "morning", "week"], "correctAnswers": ["school", "day"]}`

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that generates drag-and-drop English learning missions for elementary school students.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 400,
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('미션 생성에 실패했습니다.')
    }

    const parsedResponse = JSON.parse(responseText)
    const korean = parsedResponse.korean
    const template = parsedResponse.template
    const blanks = parsedResponse.blanks || 1
    const wordOptions = Array.isArray(parsedResponse.wordOptions) ? parsedResponse.wordOptions : []
    const correctAnswers = Array.isArray(parsedResponse.correctAnswers) ? parsedResponse.correctAnswers : []

    if (!korean || !template || wordOptions.length === 0 || correctAnswers.length === 0) {
      throw new Error('생성된 미션 데이터가 올바르지 않습니다.')
    }

    // 빈칸 개수와 정답 개수 일치 확인
    if (correctAnswers.length !== blanks) {
      throw new Error('빈칸 개수와 정답 개수가 일치하지 않습니다.')
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

    // 미션 ID 생성
    const missionId = `drag-drop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    return NextResponse.json({
      success: true,
      mission: {
        id: missionId,
        korean,
        template,
        blanks,
        wordOptions,
        correctAnswers,
        level,
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
    
    // OpenAI API 키 오류 확인
    if (error instanceof Error && error.message.includes('OPENAI_API_KEY')) {
      return NextResponse.json(
        { 
          error: 'OpenAI API 키가 설정되지 않았습니다.',
          details: '.env.local 파일에 OPENAI_API_KEY를 설정해주세요.'
        },
        { status: 500 }
      )
    }

    // OpenAI API 오류 처리
    if (error instanceof Error && (error.message.includes('401') || error.message.includes('Invalid'))) {
      return NextResponse.json(
        { 
          error: 'OpenAI API 키가 유효하지 않습니다.',
          details: '올바른 API 키를 확인해주세요.'
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        error: '미션 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
