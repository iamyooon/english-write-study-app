/**
 * 학년별 미션 상태 확인 스크립트
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { createClient } from '@supabase/supabase-js'

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

async function main() {
  console.log('📊 학년별 미션 상태 확인 중...\n')

  const { data: missions, error } = await supabase
    .from('missions')
    .select('grade, is_active')

  if (error) {
    console.error('❌ 미션 조회 실패:', error)
    process.exit(1)
  }

  if (!missions || missions.length === 0) {
    console.log('✅ 미션이 없습니다.')
    return
  }

  // 학년별 통계
  const stats: Record<number, { total: number; active: number; inactive: number }> = {}
  
  missions.forEach((mission: any) => {
    if (!stats[mission.grade]) {
      stats[mission.grade] = { total: 0, active: 0, inactive: 0 }
    }
    stats[mission.grade].total++
    if (mission.is_active) {
      stats[mission.grade].active++
    } else {
      stats[mission.grade].inactive++
    }
  })

  console.log('='.repeat(60))
  console.log('📊 학년별 미션 상태')
  console.log('='.repeat(60))
  console.log('| grade | total | active_count | inactive_count |')
  console.log('| ----- | ----- | ------------ | -------------- |')
  
  Object.keys(stats).sort((a, b) => parseInt(a) - parseInt(b)).forEach((grade) => {
    const s = stats[parseInt(grade)]
    console.log(`| ${grade}     | ${s.total.toString().padStart(5)} | ${s.active.toString().padStart(12)} | ${s.inactive.toString().padStart(14)} |`)
  })
  
  console.log('='.repeat(60))
  
  // 각 학년별로 100개인지 확인
  const allCorrect = Object.keys(stats).every((grade) => {
    return stats[parseInt(grade)].active <= 100
  })
  
  if (allCorrect) {
    console.log('\n✅ 모든 학년이 100개 이하로 활성화되어 있습니다!')
  } else {
    console.log('\n⚠️  일부 학년이 100개를 초과합니다.')
    Object.keys(stats).sort((a, b) => parseInt(a) - parseInt(b)).forEach((grade) => {
      const s = stats[parseInt(grade)]
      if (s.active > 100) {
        console.log(`  ${grade}학년: ${s.active}개 (초과: ${s.active - 100}개)`)
      }
    })
  }
}

main().catch(console.error)
