/**
 * Placement Test 제출 API
 * 
 * POST /api/placement/submit
 * 
 * 5~7문항의 Placement Test 결과를 평가하고 placement_level을 결정합니다.
 */

import { createClient } from '@/lib/supabase/server'
import { moderateContent } from '@/lib/openai/moderation'
import { openai } from '@/lib/openai/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const placementSubmitSchema = z.object({
  answers: z.array(
    z.object({
      question: z.string(),
      userAnswer: z.string(),
      timeSpent: z.number().optional(), // 초 단위
    })
  ).min(5).max(7),
  gradeLevel: z.enum(['elementary_low', 'elementary_high']).optional(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { answers, gradeLevel } = placementSubmitSchema.parse(body)

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

    // 3중 필터링: 2단계 - OpenAI Moderation (모든 답변 검사)
    for (const answer of answers) {
      const moderationResult = await moderateContent(answer.userAnswer)
      
      if (moderationResult.flagged) {
        // 부적절한 내용 감지 시 부모에게 알림 (TODO: FCM 구현)
        return NextResponse.json(
          {
            error: '부적절한 내용이 감지되었습니다.',
            details: moderationResult.details,
            questionIndex: answers.indexOf(answer) + 1,
          },
          { status: 400 }
        )
      }
    }

    // GPT-4o로 Placement Test 평가
    const evaluationPrompt = `다음은 초등학생의 영어 실력 평가 테스트 결과입니다.

학년: ${gradeLevel === 'elementary_low' ? '초등 저학년 (1-3학년)' : '초등 고학년 (4-6학년)'}

테스트 문항과 학생의 답변:
${answers
  .map(
    (answer, index) => `
${index + 1}번 문항: ${answer.question}
학생 답변: ${answer.userAnswer}
소요 시간: ${answer.timeSpent ? `${answer.timeSpent}초` : '미측정'}
`
  )
  .join('\n')}

다음 기준으로 평가해주세요:
1. 정확도 (Accuracy): 문법, 철자, 어휘 사용의 정확성
2. 완성도 (Completeness): 문장의 완성도와 의미 전달
3. 시간 효율성 (Time Efficiency): 적절한 시간 내에 답변했는지

평가 결과를 다음 JSON 형식으로 반환해주세요:
{
  "placement_level": 1-10 사이의 정수 (1: 초급, 5: 중급, 10: 고급),
  "score": 0-100 점수,
  "feedback": "격려하는 피드백 메시지 (한국어)",
  "strengths": ["강점 1", "강점 2"],
  "areas_for_improvement": ["개선점 1", "개선점 2"]
}

placement_level 결정 기준:
- 초등 저학년 기준: 1-3 (초급), 4-6 (중급), 7-10 (고급)
- 초등 고학년 기준: 1-4 (초급), 5-7 (중급), 8-10 (고급)`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a friendly English teacher for elementary school students. Evaluate the placement test results and provide encouraging feedback in Korean.',
        },
        {
          role: 'user',
          content: evaluationPrompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    })

    const evaluationText = completion.choices[0]?.message?.content
    if (!evaluationText) {
      return NextResponse.json(
        { error: '평가 결과를 생성할 수 없습니다.' },
        { status: 500 }
      )
    }

    const evaluation = JSON.parse(evaluationText)
    const placementLevel = Math.max(1, Math.min(10, evaluation.placement_level || 1))

    // 프로필에 placement_level 저장
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        placement_level: placementLevel,
        level: placementLevel, // 기본 레벨도 placement_level로 설정
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('프로필 업데이트 실패:', updateError)
      return NextResponse.json(
        { error: '결과 저장에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      placement_level: placementLevel,
      evaluation: {
        score: evaluation.score,
        feedback: evaluation.feedback,
        strengths: evaluation.strengths,
        areas_for_improvement: evaluation.areas_for_improvement,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Placement Test 제출 오류:', error)
    return NextResponse.json(
      { error: '제출 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
