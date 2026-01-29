/**
 * missions 테이블의 korean 필드가 영어인 경우 한글로 번역하여 업데이트하는 스크립트
 * 학년별로 100개만 활성화하고 나머지는 비활성화하여 로컬에 백업
 * 
 * 사용법:
 *   npm run translate-korean
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'

// .env 파일들 로드 (.env.local 우선)
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const openaiApiKey = process.env.OPENAI_API_KEY

console.log('[환경 변수 확인]')
console.log(`  NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '설정됨' : '없음'}`)
console.log(`  SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? '설정됨 (RLS 우회)' : '없음'}`)
console.log(`  사용할 키: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SERVICE_ROLE_KEY' : 'ANON_KEY'}`)
console.log(`  OPENAI_API_KEY: ${openaiApiKey ? '설정됨' : '없음'}\n`)

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

if (!openaiApiKey) {
  console.error('❌ OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const koreanRegex = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/
const MAX_ACTIVE_PER_GRADE = 100

/**
 * OpenAI API를 사용하여 영어 문장을 한글로 번역
 */
async function translateToKorean(englishSentence: string): Promise<string | null> {
  try {
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
      return translatedKorean
    }
    return null
  } catch (error) {
    console.error(`  [번역] 오류 발생:`, error)
    return null
  }
}

/**
 * 여러 미션을 배치로 업데이트
 */
async function batchUpdateMissions(updates: Array<{ id: string; missionData: any }>): Promise<{ success: number; fail: number }> {
  let successCount = 0
  let failCount = 0

  const batchSize = 50
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(updates.length / batchSize)
    
    console.log(`  배치 ${batchNum}/${totalBatches} 처리 중... (${batch.length}개)`)

    const updatePromises = batch.map(async (update) => {
      try {
        const { error } = await supabase
          .from('missions')
          .update({ mission_data: update.missionData })
          .eq('id', update.id)

        if (error) {
          return false
        }
        return true
      } catch (error) {
        return false
      }
    })

    const results = await Promise.all(updatePromises)
    results.forEach((success) => {
      if (success) {
        successCount++
      } else {
        failCount++
      }
    })

    const processed = Math.min(i + batchSize, updates.length)
    console.log(`  ✅ 진행: ${processed}/${updates.length} (성공: ${successCount}, 실패: ${failCount})`)
  }

  return { success: successCount, fail: failCount }
}

/**
 * 여러 미션의 is_active를 false로 설정
 */
async function deactivateMissions(missionIds: string[]): Promise<{ success: number; fail: number }> {
  let successCount = 0
  let failCount = 0

  const batchSize = 100
  for (let i = 0; i < missionIds.length; i += batchSize) {
    const batch = missionIds.slice(i, i + batchSize)
    
    const updatePromises = batch.map(async (id) => {
      try {
        const { error } = await supabase
          .from('missions')
          .update({ is_active: false })
          .eq('id', id)

        if (error) {
          return false
        }
        return true
      } catch (error) {
        return false
      }
    })

    const results = await Promise.all(updatePromises)
    results.forEach((success) => {
      if (success) {
        successCount++
      } else {
        failCount++
      }
    })

    const processed = Math.min(i + batchSize, missionIds.length)
    console.log(`  ✅ 비활성화 진행: ${processed}/${missionIds.length} (성공: ${successCount}, 실패: ${failCount})`)
  }

  return { success: successCount, fail: failCount }
}

async function main() {
  console.log('🚀 영어 문장을 한글로 번역하고 학년별로 100개만 활성화하는 작업을 시작합니다...\n')

  // 1. 모든 미션 조회
  console.log('📊 모든 미션 조회 중...')
  const { data: allMissions, error: fetchError } = await supabase
    .from('missions')
    .select('id, grade, grade_level, mission_data, is_active, mission_type')

  if (fetchError) {
    console.error('❌ 미션 조회 실패:', fetchError)
    process.exit(1)
  }

  if (!allMissions || allMissions.length === 0) {
    console.log('✅ 처리할 미션이 없습니다.')
    return
  }

  console.log(`📈 전체 미션: ${allMissions.length}개\n`)

  // 2. 학년별로 모든 미션 그룹화
  const allMissionsByGrade: Record<number, any[]> = {}
  allMissions.forEach((mission: any) => {
    if (!allMissionsByGrade[mission.grade]) {
      allMissionsByGrade[mission.grade] = []
    }
    allMissionsByGrade[mission.grade].push(mission)
  })

  console.log('📊 학년별 전체 미션:')
  Object.keys(allMissionsByGrade).sort().forEach((grade) => {
    console.log(`  ${grade}학년: ${allMissionsByGrade[parseInt(grade)].length}개`)
  })

  // 3. 각 학년별로 100개만 선택 (나머지는 비활성화)
  const missionsToKeep: any[] = []
  const missionsToDeactivate: string[] = []
  const backupData: any = {
    timestamp: new Date().toISOString(),
    byGrade: {} as Record<string, any[]>
  }

  Object.keys(allMissionsByGrade).sort().forEach((grade) => {
    const gradeMissions = allMissionsByGrade[parseInt(grade)]
    const selected = gradeMissions.slice(0, MAX_ACTIVE_PER_GRADE)
    const toDeactivate = gradeMissions.slice(MAX_ACTIVE_PER_GRADE)

    missionsToKeep.push(...selected)
    missionsToDeactivate.push(...toDeactivate.map(m => m.id))
    
    backupData.byGrade[grade] = toDeactivate.map(m => ({
      id: m.id,
      grade: m.grade,
      grade_level: m.grade_level,
      mission_data: m.mission_data,
      is_active: m.is_active,
      mission_type: m.mission_type
    }))

    console.log(`\n  ${grade}학년:`)
    console.log(`    활성화 유지: ${selected.length}개`)
    console.log(`    비활성화 및 백업: ${toDeactivate.length}개`)
  })

  // 4. 영어 문장이 있는 미션 필터링 (번역 대상)
  const missionsToTranslate = missionsToKeep.filter((mission: any) => {
    const korean = mission.mission_data?.korean
    return korean && !koreanRegex.test(korean)
  })

  console.log(`\n📝 번역 대상: ${missionsToTranslate.length}개 (활성화 유지 중 영어 문장이 있는 미션)`)

  // 5. 백업 데이터 저장
  if (missionsToDeactivate.length > 0) {
    const backupFile = resolve(process.cwd(), 'missions-backup.json')
    writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf-8')
    console.log(`\n💾 백업 데이터 저장: ${backupFile}`)
    console.log(`   백업된 미션: ${missionsToDeactivate.length}개`)
  }

  // 6. 나머지 미션들 비활성화
  if (missionsToDeactivate.length > 0) {
    console.log(`\n📤 ${missionsToDeactivate.length}개 미션을 비활성화 중...`)
    const deactivateResults = await deactivateMissions(missionsToDeactivate)
    console.log(`✅ 비활성화 완료: 성공 ${deactivateResults.success}개, 실패 ${deactivateResults.fail}개`)
  }

  // 7. 영어 문장이 있는 미션 번역
  if (missionsToTranslate.length === 0) {
    console.log('\n✅ 번역할 영어 문장이 없습니다. 모든 작업이 완료되었습니다.')
    return
  }

  console.log(`\n📝 ${missionsToTranslate.length}개 미션 번역 시작...\n`)
  const translationResults: Array<{ id: string; missionData: any }> = []
  let translationFailCount = 0

  for (let i = 0; i < missionsToTranslate.length; i++) {
    const mission = missionsToTranslate[i]
    const englishKorean = mission.mission_data?.korean

    if ((i + 1) % 10 === 0 || i === 0) {
      console.log(`[${i + 1}/${missionsToTranslate.length}] 미션 ID: ${mission.id}`)
      console.log(`  학년: ${mission.grade}, korean: "${englishKorean}"`)
    }

    const translatedKorean = await translateToKorean(englishKorean)

    if (!translatedKorean) {
      translationFailCount++
      continue
    }

    const updatedMissionData = {
      ...mission.mission_data,
      korean: translatedKorean
    }
    translationResults.push({
      id: mission.id,
      missionData: updatedMissionData
    })

    if (i < missionsToTranslate.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 400))
    }
  }

  console.log(`\n📊 번역 완료: 성공 ${translationResults.length}개, 실패 ${translationFailCount}개`)

  // 8. 번역된 미션들 업데이트
  if (translationResults.length > 0) {
    console.log(`\n📤 ${translationResults.length}개 미션을 배치로 업데이트 중...`)
    const updateResults = await batchUpdateMissions(translationResults)
    
    console.log(`\n✅ 업데이트 완료: 성공 ${updateResults.success}개, 실패 ${updateResults.fail}개`)
  }

  // 9. 최종 결과 출력
  console.log('\n' + '='.repeat(60))
  console.log('📊 전체 작업 완료')
  console.log('='.repeat(60))
  console.log(`📝 번역 성공: ${translationResults.length}개`)
  console.log(`📝 번역 실패: ${translationFailCount}개`)
  console.log(`📤 업데이트 성공: ${translationResults.length}개`)
  console.log(`✅ 활성화 유지: ${missionsToKeep.length}개 (학년별 최대 ${MAX_ACTIVE_PER_GRADE}개)`)
  console.log(`📦 비활성화: ${missionsToDeactivate.length}개`)
  console.log(`💾 백업 파일: missions-backup.json`)
  console.log('='.repeat(60))
}

main().catch((error) => {
  console.error('❌ 예상치 못한 오류 발생:', error)
  process.exit(1)
})
