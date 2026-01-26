/**
 * missions 테이블의 korean 필드가 영어인 경우 한글로 번역하여 업데이트하는 스크립트
 * 
 * 사용법:
 *   npm run translate-korean
 * 
 * 주의사항:
 *   - OPENAI_API_KEY 환경 변수가 필요합니다
 *   - NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY 환경 변수가 필요합니다
 *   - 한 번에 모든 미션을 처리하므로 시간이 걸릴 수 있습니다
 *   - OpenAI API 호출 비용이 발생할 수 있습니다
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// .env 파일 로드
config()

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const openaiApiKey = process.env.OPENAI_API_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.')
  console.error('   NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정해주세요.')
  process.exit(1)
}

if (!openaiApiKey) {
  console.error('❌ OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// 한글 포함 여부 확인 정규식
const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/

/**
 * OpenAI API를 사용하여 영어 문장을 한글로 번역
 */
async function translateToKorean(englishSentence: string): Promise<string | null> {
  try {
    console.log(`  [번역] 시작: "${englishSentence}"`)
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful translator. Translate the given English sentence to Korean. Return ONLY the Korean translation without any explanation or additional comments. The translation should be natural and appropriate for elementary school students.'
          },
          {
            role: 'user',
            content: `Translate this English sentence to Korean: "${englishSentence}"\n\nReturn only the Korean translation:`
          }
        ],
        temperature: 0.3,
        max_tokens: 100,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error(`  [번역] API 오류: ${response.status}`, errorData)
      return null
    }

    const data = await response.json()
    const translatedKorean = data.choices?.[0]?.message?.content?.trim()
    
    if (translatedKorean) {
      console.log(`  [번역] 완료: "${translatedKorean}"`)
      return translatedKorean
    } else {
      console.warn(`  [번역] 응답에서 번역 결과를 찾을 수 없음`)
      return null
    }
  } catch (error) {
    console.error(`  [번역] 오류 발생:`, error)
    return null
  }
}

/**
 * 미션의 korean 필드를 업데이트
 */
async function updateMissionKorean(missionId: string, newKorean: string, currentMissionData: any): Promise<boolean> {
  try {
    const updatedMissionData = {
      ...currentMissionData,
      korean: newKorean
    }

    const { error } = await supabase
      .from('missions')
      .update({ mission_data: updatedMissionData })
      .eq('id', missionId)

    if (error) {
      console.error(`  [업데이트] 실패:`, error)
      return false
    }

    console.log(`  [업데이트] 성공`)
    return true
  } catch (error) {
    console.error(`  [업데이트] 오류 발생:`, error)
    return false
  }
}

/**
 * 메인 함수
 */
async function main() {
  console.log('🚀 영어 문장을 한글로 번역하는 작업을 시작합니다...\n')

  // 1. 영어 문장이 있는 미션들 조회
  console.log('📊 영어 문장이 있는 미션 조회 중...')
  const { data: missions, error: fetchError } = await supabase
    .from('missions')
    .select('id, grade, grade_level, mission_data')
    .eq('mission_type', 'keyboard')
    .eq('is_active', true)

  if (fetchError) {
    console.error('❌ 미션 조회 실패:', fetchError)
    process.exit(1)
  }

  if (!missions || missions.length === 0) {
    console.log('✅ 처리할 미션이 없습니다.')
    return
  }

  // 2. 영어 문장이 있는 미션 필터링
  const englishMissions = missions.filter((mission: any) => {
    const korean = mission.mission_data?.korean
    return korean && !koreanRegex.test(korean)
  })

  console.log(`📈 전체 미션: ${missions.length}개`)
  console.log(`📈 영어 문장 미션: ${englishMissions.length}개\n`)

  if (englishMissions.length === 0) {
    console.log('✅ 모든 미션의 korean 필드가 한글입니다.')
    return
  }

  // 3. 각 미션을 번역하여 업데이트
  let successCount = 0
  let failCount = 0

  for (let i = 0; i < englishMissions.length; i++) {
    const mission = englishMissions[i]
    const englishKorean = mission.mission_data?.korean

    console.log(`\n[${i + 1}/${englishMissions.length}] 미션 ID: ${mission.id}`)
    console.log(`  학년: ${mission.grade}, 레벨: ${mission.grade_level}`)
    console.log(`  현재 korean: "${englishKorean}"`)

    // 번역
    const translatedKorean = await translateToKorean(englishKorean)

    if (!translatedKorean) {
      console.log(`  ⚠️  번역 실패, 건너뜀`)
      failCount++
      continue
    }

    // 업데이트
    const updated = await updateMissionKorean(mission.id, translatedKorean, mission.mission_data)

    if (updated) {
      successCount++
    } else {
      failCount++
    }

    // API 호출 제한을 고려한 딜레이 (초당 3개 요청 제한)
    if (i < englishMissions.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 400))
    }
  }

  // 4. 결과 출력
  console.log('\n' + '='.repeat(50))
  console.log('📊 작업 완료')
  console.log(`✅ 성공: ${successCount}개`)
  console.log(`❌ 실패: ${failCount}개`)
  console.log(`📈 전체: ${englishMissions.length}개`)
  console.log('='.repeat(50))
}

// 스크립트 실행
main().catch((error) => {
  console.error('❌ 예상치 못한 오류 발생:', error)
  process.exit(1)
})
