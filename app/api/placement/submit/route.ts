/**
 * Placement Test 제출 API
 * 
 * POST /api/placement/submit
 * 
 * 5~7문항의 Placement Test 결과를 평가하고 적절한 학년을 추천합니다.
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
  noAccount: z.boolean().optional().default(false), // 계정 없이 진행하는지
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { answers, gradeLevel, noAccount } = placementSubmitSchema.parse(body)

    let user: any = null
    let supabase: any = null

    // 계정이 있는 경우: 인증 확인
    if (!noAccount) {
      supabase = await createClient()
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
      }

      user = authUser

      // 프로필 확인
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (!profile) {
        return NextResponse.json({ error: '프로필을 찾을 수 없습니다.' }, { status: 404 })
      }
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
    // Placement Test는 적절한 학년만 추천합니다 (레벨 시스템 없음)
    const evaluationPrompt = `다음은 초등학생의 영어 실력 평가 테스트 결과입니다.

참고 정보:
- 테스트 대상 학년 수준: ${gradeLevel === 'elementary_low' ? '초등 저학년 (1-3학년)' : '초등 고학년 (4-6학년)'}

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
  "recommended_grade": 1-6 사이의 정수 (학생의 영어 실력에 적절한 학년 추천),
  "score": 0-100 점수,
  "feedback": "격려하는 피드백 메시지 (한국어)",
  "strengths": ["강점 1", "강점 2"],
  "areas_for_improvement": ["개선점 1", "개선점 2"]
}

recommended_grade 결정 기준:
- 학생의 실제 영어 실력에 맞는 학년을 추천하세요.
- 예: 1학년 수준의 실력이면 recommended_grade = 1
- 예: 4학년 수준의 실력이면 recommended_grade = 4
- 예: 6학년 수준의 실력이면 recommended_grade = 6
- 예: 4학년 학생이지만 영어 실력이 부족하면 recommended_grade = 1-2
- 예: 1학년 학생이지만 영어 실력이 뛰어나면 recommended_grade = 4-6

중요: 
- 학년은 문항 난이도 결정에만 사용되었으며, 추천 학년 평가에는 영향을 주지 않습니다.
- 실제 영어 실력만을 기준으로 적절한 학년을 추천하세요.`

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
    const recommendedGrade = evaluation.recommended_grade ? Math.max(1, Math.min(6, evaluation.recommended_grade)) : null

    if (!recommendedGrade) {
      return NextResponse.json(
        { error: '학년 추천 결과를 생성할 수 없습니다.' },
        { status: 500 }
      )
    }

    // 계정이 있는 경우에만 프로필에 저장
    if (!noAccount && user && supabase) {
      const updateData: any = {
        grade: recommendedGrade,
      }
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)

      if (updateError) {
        console.error('프로필 업데이트 실패:', updateError)
        return NextResponse.json(
          { error: '결과 저장에 실패했습니다.' },
          { status: 500 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      recommended_grade: recommendedGrade,
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
        { error: '잘못된 요청 데이터입니다.', details: error.issues },
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
