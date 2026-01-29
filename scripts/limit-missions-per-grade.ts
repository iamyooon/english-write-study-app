/**
 * 학년별로 100개만 활성화하고 나머지는 비활성화하는 스크립트
 * 이미 번역이 완료된 상태에서 실행
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'
import { writeFileSync } from 'fs'

// .env 파일들 로드 (.env.local 우선)
config({ path: resolve(process.cwd(), '.env.local') })
config({ path: resolve(process.cwd(), '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)
const MAX_ACTIVE_PER_GRADE = 100

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
          console.error(`  ❌ ID ${id} 비활성화 실패:`, error.message)
          return false
        }
        return true
      } catch (error) {
        console.error(`  ❌ ID ${id} 비활성화 오류:`, error)
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
    if (processed % 500 === 0 || processed === missionIds.length) {
      console.log(`  ✅ 비활성화 진행: ${processed}/${missionIds.length} (성공: ${successCount}, 실패: ${failCount})`)
    }
  }

  return { success: successCount, fail: failCount }
}

async function main() {
  console.log('🚀 학년별로 100개만 활성화하고 나머지는 비활성화하는 작업을 시작합니다...\n')

  // 1. 모든 활성화된 미션 조회
  console.log('📊 활성화된 미션 조회 중...')
  const { data: activeMissions, error: fetchError } = await supabase
    .from('missions')
    .select('id, grade, grade_level, mission_data, is_active, mission_type')
    .eq('is_active', true)

  if (fetchError) {
    console.error('❌ 미션 조회 실패:', fetchError)
    process.exit(1)
  }

  if (!activeMissions || activeMissions.length === 0) {
    console.log('✅ 활성화된 미션이 없습니다.')
    return
  }

  console.log(`📈 활성화된 미션: ${activeMissions.length}개\n`)

  // 2. 학년별로 그룹화
  const missionsByGrade: Record<number, any[]> = {}
  activeMissions.forEach((mission: any) => {
    if (!missionsByGrade[mission.grade]) {
      missionsByGrade[mission.grade] = []
    }
    missionsByGrade[mission.grade].push(mission)
  })

  console.log('📊 학년별 활성화된 미션:')
  Object.keys(missionsByGrade).sort().forEach((grade) => {
    console.log(`  ${grade}학년: ${missionsByGrade[parseInt(grade)].length}개`)
  })

  // 3. 각 학년별로 100개만 유지하고 나머지는 비활성화
  const missionsToKeep: any[] = []
  const missionsToDeactivate: string[] = []
  const backupData: any = {
    timestamp: new Date().toISOString(),
    byGrade: {} as Record<string, any[]>
  }

  Object.keys(missionsByGrade).sort().forEach((grade) => {
    const gradeMissions = missionsByGrade[parseInt(grade)]
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
    console.log(`    비활성화: ${toDeactivate.length}개`)
  })

  // 4. 백업 데이터 저장
  if (missionsToDeactivate.length > 0) {
    const backupFile = resolve(process.cwd(), 'missions-backup-limit.json')
    writeFileSync(backupFile, JSON.stringify(backupData, null, 2), 'utf-8')
    console.log(`\n💾 백업 데이터 저장: ${backupFile}`)
    console.log(`   백업된 미션: ${missionsToDeactivate.length}개`)
  }

  // 5. 나머지 미션들 비활성화
  if (missionsToDeactivate.length > 0) {
    console.log(`\n📤 ${missionsToDeactivate.length}개 미션을 비활성화 중...`)
    const deactivateResults = await deactivateMissions(missionsToDeactivate)
    
    console.log(`\n✅ 비활성화 완료:`)
    console.log(`   성공: ${deactivateResults.success}개`)
    console.log(`   실패: ${deactivateResults.fail}개`)
  } else {
    console.log('\n✅ 모든 학년이 이미 100개 이하입니다.')
  }

  // 6. 최종 결과 출력
  console.log('\n' + '='.repeat(60))
  console.log('📊 작업 완료')
  console.log('='.repeat(60))
  console.log(`✅ 활성화 유지: ${missionsToKeep.length}개 (학년별 최대 ${MAX_ACTIVE_PER_GRADE}개)`)
  console.log(`📦 비활성화: ${missionsToDeactivate.length}개`)
  console.log(`💾 백업 파일: missions-backup-limit.json`)
  console.log('='.repeat(60))
}

main().catch((error) => {
  console.error('❌ 예상치 못한 오류 발생:', error)
  process.exit(1)
})
