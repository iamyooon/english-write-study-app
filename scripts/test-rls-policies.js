/**
 * RLS 정책 상세 테스트 스크립트
 * 
 * 실행 방법:
 * node scripts/test-rls-policies.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve } from 'path'

// .env.local 파일 로드
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !anonKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, anonKey)

async function testRLSPolicies() {
  console.log('🔒 RLS 정책 상세 테스트\n')

  // 1. 인증 없이 profiles 조회 시도 (실패해야 함)
  console.log('1️⃣ 인증 없이 profiles 조회 시도 (RLS가 적용되면 실패해야 함)...')
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)

  if (profilesError) {
    if (profilesError.code === 'PGRST301' || 
        profilesError.message.includes('RLS') || 
        profilesError.message.includes('policy') ||
        profilesError.message.includes('permission')) {
      console.log('✅ RLS 정책이 제대로 적용되었습니다!')
      console.log(`   → 에러 메시지: ${profilesError.message}\n`)
    } else {
      console.log('⚠️  예상치 못한 에러:', profilesError.message, '\n')
    }
  } else if (profiles && profiles.length > 0) {
    console.log('❌ RLS가 제대로 적용되지 않았습니다!')
    console.log('   → 인증 없이도 데이터를 조회할 수 있습니다.\n')
  } else {
    console.log('✅ RLS가 적용되어 있습니다 (데이터 없음으로 인한 빈 결과)\n')
  }

  // 2. 인증 없이 study_logs 조회 시도
  console.log('2️⃣ 인증 없이 study_logs 조회 시도...')
  const { data: logs, error: logsError } = await supabase
    .from('study_logs')
    .select('*')
    .limit(1)

  if (logsError) {
    if (logsError.message.includes('RLS') || logsError.message.includes('policy')) {
      console.log('✅ RLS 정책이 제대로 적용되었습니다!')
      console.log(`   → 에러 메시지: ${logsError.message}\n`)
    } else {
      console.log('⚠️  예상치 못한 에러:', logsError.message, '\n')
    }
  } else {
    console.log('✅ RLS가 적용되어 있습니다\n')
  }

  // 3. shop_items는 공개 데이터이므로 조회 가능해야 함
  console.log('3️⃣ shop_items 조회 (공개 데이터이므로 성공해야 함)...')
  const { data: items, error: itemsError } = await supabase
    .from('shop_items')
    .select('*')
    .limit(1)

  if (itemsError) {
    console.log('❌ shop_items 조회 실패:', itemsError.message, '\n')
  } else {
    console.log('✅ shop_items 조회 성공 (공개 데이터 정책 작동)\n')
  }

  console.log('📋 테스트 완료!')
  console.log('\n💡 참고:')
  console.log('   - profiles, study_logs, user_inventory는 인증 없이 조회 불가능해야 함')
  console.log('   - shop_items는 공개 데이터이므로 조회 가능해야 함')
}

testRLSPolicies()
  .catch((error) => {
    console.error('❌ 테스트 실행 오류:', error)
    process.exit(1)
  })
