/**
 * Writing 제출 API
 * 
 * POST /api/study/submit
 * 
 * 3중 필터링 → AI 피드백 생성 → DB 저장
 */

import { createClient } from '@/lib/supabase/server'
import { moderateContent } from '@/lib/openai/moderation'
import { openai } from '@/lib/openai/client'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const submitSchema = z.object({
  missionText: z.string(),
  userInput: z.string().min(1, '영어 문장을 입력해주세요.'),
  gradeLevel: z.enum(['elementary_low', 'elementary_high']).optional(),
  level: z.number().min(1).max(10).optional(),
  skipQueue: z.boolean().optional().default(false),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { missionText, userInput, gradeLevel, level, skipQueue } =
      submitSchema.parse(body)

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

    // 3중 필터링: 2단계 - OpenAI Moderation
    const moderationResult = await moderateContent(userInput)

    if (moderationResult.flagged) {
      // 부적절한 내용 감지 시 부모에게 알림 (TODO: FCM 구현)
      return NextResponse.json(
        {
          error: '부적절한 내용이 감지되었습니다.',
          details: moderationResult.details,
        },
        { status: 400 }
      )
    }

    // Queue 체크 (무료 유저 일일 제한)
    // 참고: daily_usage 테이블이 없으므로 profiles의 feedback_usage_today 사용
    let queueStatus = 'completed'
    let queuePosition: number | null = null

    if (!skipQueue && !profile.is_premium) {
      const feedbackCount = profile.feedback_usage_today || 0
      const freeLimit = 5 // 무료 유저 일일 제한

      if (feedbackCount >= freeLimit) {
        // Queue에 추가
        queueStatus = 'queued'
        // TODO: Queue 위치 계산
        queuePosition = 1
      } else {
        // 사용량 증가
        await supabase
          .from('profiles')
          .update({ feedback_usage_today: feedbackCount + 1 })
          .eq('id', user.id)
      }
    }

    // AI 피드백 생성
    let aiFeedback = null
    if (queueStatus === 'completed') {
      const feedbackPrompt = `다음 한글 문장을 영어로 번역한 결과를 평가해주세요.

원문 (한글): ${missionText}
학생이 작성한 영어: ${userInput}
수준: ${gradeLevel === 'elementary_low' ? '초등 저학년' : '초등 고학년'}

다음 형식으로 JSON 응답:
{
  "score": 0-100 점수,
  "feedback": "친절하고 격려하는 피드백 메시지",
  "corrected": "교정된 영어 문장 (필요시)",
  "errors": [
    {
      "type": "grammar|spelling|vocabulary",
      "original": "틀린 부분",
      "corrected": "올바른 표현",
      "explanation": "설명"
    }
  ],
  "suggestions": ["개선 제안 1", "개선 제안 2"]
}`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are a friendly English teacher for elementary school students. Provide encouraging and constructive feedback in Korean.',
          },
          {
            role: 'user',
            content: feedbackPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' },
      })

      const feedbackText = completion.choices[0]?.message?.content
      if (feedbackText) {
        aiFeedback = JSON.parse(feedbackText)
      }
    }

    // study_logs에 저장
    // 참고: 실제 스키마에 맞춰 필드 제한 (queue_position, grade_level, level, moderation_passed, moderation_details는 스키마에 없음)
    const { data: studyLog, error: logError } = await supabase
      .from('study_logs')
      .insert({
        user_id: user.id,
        mission_text: missionText,
        user_input: userInput,
        ai_feedback: aiFeedback,
        status: queueStatus,
        is_public: false,
      })
      .select()
      .single()

    if (logError) {
      console.error('학습 로그 저장 실패:', logError)
      return NextResponse.json(
        { error: '저장 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      studyLog,
      feedback: aiFeedback,
      queueStatus,
      queuePosition,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: error.errors },
        { status: 400 }
      )
    }

    console.error('제출 오류:', error)
    return NextResponse.json(
      { error: '제출 중 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
