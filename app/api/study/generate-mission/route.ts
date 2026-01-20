/**
 * 한글 문장 생성 API
 * 
 * POST /api/study/generate-mission
 * 
 * 수준에 맞는 한글 문장을 생성합니다.
 */

import { createClient } from '@/lib/supabase/server'
import { openai } from '@/lib/openai/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const generateMissionSchema = z.object({
  gradeLevel: z.enum(['elementary_low', 'elementary_high']),
  level: z.number().min(1).max(10).default(1),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { gradeLevel, level } = generateMissionSchema.parse(body)

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

    // 에너지 체크 (문장 생성 시 1 에너지 소모)
    const currentEnergy = profile.energy || 0
    const energyCost = 1

    if (currentEnergy < energyCost) {
      return NextResponse.json(
        {
          error: '에너지가 부족합니다.',
          details: `문장 생성을 위해 ${energyCost} 에너지가 필요합니다. (현재: ${currentEnergy})`,
          currentEnergy,
          requiredEnergy: energyCost,
        },
        { status: 400 }
      )
    }

    // 수준에 맞는 프롬프트 생성
    const levelDescription =
      gradeLevel === 'elementary_low'
        ? '초등학교 저학년(1-3학년) 수준의 간단한 문장'
        : '초등학교 고학년(4-6학년) 수준의 문장'

    const prompt = `다음 조건에 맞는 한글 문장과 함께 어휘 목록과 예시 문장을 생성해주세요:
- 대상: ${levelDescription}
- 난이도 레벨: ${level}/10
- 주제: 일상생활, 가족, 학교, 취미 등 초등학생에게 친숙한 주제
- 길이: ${gradeLevel === 'elementary_low' ? '5-8단어' : '8-12단어'}

다음 JSON 형식으로 응답해주세요:
{
  "korean": "생성된 한글 문장",
  "vocabulary": ["주요 단어1", "주요 단어2", "주요 단어3"],
  "example": "영어 예시 문장"
}

- vocabulary: 한글 문장을 영어로 번역할 때 필요한 주요 단어 3-5개 (영어 단어)
- example: 한글 문장을 영어로 번역한 예시 문장 (초등학생 수준의 간단한 영어)

예시:
- 저학년: {"korean": "나는 사과를 좋아해요", "vocabulary": ["I", "like", "apple"], "example": "I like apples."}
- 고학년: {"korean": "나는 매일 아침 일찍 일어나서 운동을 해요", "vocabulary": ["I", "every", "morning", "early", "exercise"], "example": "I wake up early every morning and exercise."}`

    // OpenAI API 호출
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful assistant that generates Korean sentences for elementary school students learning English.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 300,
      response_format: { type: 'json_object' },
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('문장 생성에 실패했습니다.')
    }

    const parsedResponse = JSON.parse(responseText)
    const koreanSentence = parsedResponse.korean
    const vocabulary = parsedResponse.vocabulary || []
    const example = parsedResponse.example || ''

    if (!koreanSentence) {
      throw new Error('생성된 문장을 찾을 수 없습니다.')
    }

    // 에너지 소모
    const newEnergy = Math.max(0, currentEnergy - energyCost)
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ energy: newEnergy })
      .eq('id', user.id)

    if (updateError) {
      console.error('에너지 업데이트 실패:', updateError)
      // 에너지 업데이트 실패해도 문장은 반환 (일관성 유지)
    }

    return NextResponse.json({
      success: true,
      mission: {
        korean: koreanSentence,
        vocabulary: Array.isArray(vocabulary) ? vocabulary : [],
        example: example,
        gradeLevel,
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
        { error: '잘못된 요청 데이터입니다.', details: error.errors },
        { status: 400 }
      )
    }

    console.error('문장 생성 오류:', error)
    
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
        error: '문장 생성 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
