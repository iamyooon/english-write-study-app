/**
 * Placement Test 문항 생성 API
 * 
 * GET /api/placement/questions
 * 
 * 학년 수준에 맞는 Placement Test 문항을 생성합니다.
 */

import { openai } from '@/lib/openai/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const questionsQuerySchema = z.object({
  gradeLevel: z.enum(['elementary_low', 'elementary_high']).optional(),
  count: z.coerce.number().min(5).max(7).optional().default(6),
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const gradeLevel = searchParams.get('gradeLevel') as 'elementary_low' | 'elementary_high' | null
    const count = parseInt(searchParams.get('count') || '6', 10)

    const validated = questionsQuerySchema.parse({
      gradeLevel: gradeLevel || undefined,
      count,
    })

    // GPT-4o로 Placement Test 문항 생성
    const prompt = `${validated.gradeLevel === 'elementary_low' ? '초등 저학년 (1-3학년)' : '초등 고학년 (4-6학년)'} 수준에 맞는 영어 Placement Test 문항 ${validated.count}개를 생성해주세요.

각 문항은 다음 형식을 따라야 합니다:
- 한글 문장을 영어로 번역하는 문제
- 간단하고 명확한 지시사항
- 초등학생 수준에 적합한 어휘와 문법

다음 JSON 형식으로 반환해주세요:
{
  "questions": [
    {
      "id": 1,
      "korean": "나는 사과를 좋아해요.",
      "instruction": "위 한글 문장을 영어로 번역해주세요.",
      "expected_keywords": ["I", "like", "apple/apples"]
    },
    ...
  ]
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are an English teacher creating placement test questions for elementary school students. Generate appropriate questions in Korean.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.8,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    })

    const questionsText = completion.choices[0]?.message?.content
    if (!questionsText) {
      return NextResponse.json(
        { error: '문항을 생성할 수 없습니다.' },
        { status: 500 }
      )
    }

    const questionsData = JSON.parse(questionsText)

    return NextResponse.json({
      success: true,
      questions: questionsData.questions || [],
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Placement Test 문항 생성 오류:', error)
    return NextResponse.json(
      { error: '문항 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
