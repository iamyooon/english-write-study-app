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
import { consumeEnergy, produceEnergy } from '@/lib/supabase/utils'
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

    // 타입 단언 (Supabase 타입 추론 문제 해결)
    const profileData = profile as {
      energy?: number
      is_premium?: boolean
      feedback_usage_today?: number
    } | null
    if (!profileData) {
      return NextResponse.json({ error: '프로필을 찾을 수 없습니다.' }, { status: 404 })
    }

    // 에너지 체크 및 소비 (미션 1회당 100 소비)
    try {
      await consumeEnergy(user.id, 100)
    } catch (error) {
      // 에너지 부족 시 에러 반환
      if (error instanceof Error && error.message.includes('Insufficient energy')) {
        return NextResponse.json(
          {
            error: '에너지가 부족합니다. 내일 에너지가 충전되면 다시 시도해주세요.',
            energyRequired: 100,
            currentEnergy: profileData.energy || 0,
          },
          { status: 403 }
        )
      }
      throw error // 다른 에러는 그대로 전파
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

    if (!skipQueue && !profileData.is_premium) {
      const feedbackCount = profileData.feedback_usage_today || 0
      const freeLimit = 5 // 무료 유저 일일 제한

      if (feedbackCount >= freeLimit) {
        // Queue에 추가
        queueStatus = 'queued'
        // TODO: Queue 위치 계산
        queuePosition = 1
      } else {
        // 사용량 증가
        // 타입 단언 (Supabase 타입 추론 문제 해결)
        const updateSupabase = supabase as any
        await updateSupabase
          .from('profiles')
          .update({ feedback_usage_today: feedbackCount + 1 })
          .eq('id', user.id)
      }
    }

    // AI 피드백 생성
    let aiFeedback = null
    if (queueStatus === 'completed') {
      console.log('[API 제출] 평가 시작:', { missionText, userInput, gradeLevel })
      const feedbackPrompt = `다음 한글 문장을 영어로 번역한 결과를 평가해주세요.

원문 (한글): ${missionText}
학생이 작성한 영어: ${userInput}
수준: ${gradeLevel === 'elementary_low' ? '초등 저학년' : '초등 고학년'}

**중요: 반드시 다음 형식으로 JSON 응답을 제공하세요. 모든 필드는 필수입니다.**

{
  "score": 0-100 점수,
  "feedback": "친절하고 격려하는 피드백 메시지",
  "corrected": "교정된 영어 문장 (필요시)",
  "hint": "다음 문장을 작성할 때 도움이 되는 구체적인 힌트를 반드시 제공하세요. 정답이든 오답이든 항상 힌트를 제공해야 합니다. 예: '다음 문장에서는 과거형 동사(was, went, played 등)를 사용해보세요' 또는 '이 문장에서 주의할 점은 주어와 동사의 일치입니다'",
  "errors": [
    {
      "type": "grammar|spelling|vocabulary",
      "original": "틀린 부분",
      "corrected": "올바른 표현",
      "explanation": "설명"
    }
  ],
  "suggestions": ["개선 제안 1", "개선 제안 2"]
}

**힌트(hint) 필드는 반드시 포함되어야 하며, 빈 문자열이 아니어야 합니다.**`

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
      console.log('[API 제출] AI 응답 받음:', { hasContent: !!feedbackText, contentLength: feedbackText?.length })
      
      if (feedbackText) {
        try {
          aiFeedback = JSON.parse(feedbackText)
          console.log('[API 제출] 피드백 파싱 완료:', { score: aiFeedback?.score, hasHint: !!aiFeedback?.hint })
        } catch (parseError) {
          console.error('[API 제출] JSON 파싱 오류:', parseError)
        }
      }
      
      // aiFeedback이 없거나 힌트가 없는 경우 항상 힌트 생성
      if (!aiFeedback) {
        console.warn('[API 제출] aiFeedback 없음, 기본값 생성')
        aiFeedback = { score: 0, feedback: '평가가 완료되었습니다.' }
      }
      
      // 힌트가 없거나 빈 문자열인 경우 기본 힌트 생성
      if (!aiFeedback.hint || aiFeedback.hint.trim() === '') {
        const score = aiFeedback.score || 0
        console.log('[API 제출] 힌트 없음, 기본 힌트 생성:', { score })
        if (score >= 80) {
          aiFeedback.hint = '잘했어요! 다음 문장도 같은 실력을 발휘해보세요. 문법과 단어 선택에 주의하면서 작성해보세요.'
        } else {
          aiFeedback.hint = '다음 문장을 작성할 때는 문법 규칙과 단어의 올바른 사용법을 다시 한번 확인해보세요. 천천히 생각하면서 작성하면 더 좋은 결과를 얻을 수 있어요!'
        }
      } else {
        console.log('[API 제출] 힌트 있음:', { hint: aiFeedback.hint.substring(0, 50) + '...' })
      }
    }

    // 에너지 증가 로직 제거 (학습 시 에너지는 감소만 함)
    let energyGained = 0

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
        energy_gained: energyGained,
      } as any)
      .select()
      .single()

    if (logError) {
      console.error('학습 로그 저장 실패:', logError)
      return NextResponse.json(
        { error: '저장 중 오류가 발생했습니다.' },
        { status: 500 }
      )
    }

    console.log('[API 제출] 응답 전송:', { 
      success: true, 
      hasStudyLog: !!studyLog, 
      feedbackScore: aiFeedback?.score, 
      hasHint: !!aiFeedback?.hint,
      queueStatus,
      energyGained 
    })
    
    return NextResponse.json({
      success: true,
      studyLog,
      feedback: aiFeedback,
      queueStatus,
      queuePosition,
      energyGained,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: '잘못된 요청 데이터입니다.', details: error.issues },
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
