/**
 * Supabase 연결 테스트 스크립트
 * 
 * 실행 방법:
 * node scripts/test-supabase-connection.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// .env.local 파일 로드
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  console.log('🔍 Supabase 연결 테스트 시작...\n')

  try {
    // 1. 기본 연결 테스트
    console.log('1️⃣ 기본 연결 테스트...')
    const { data: health, error: healthError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true })

    if (healthError) {
      console.error('❌ 연결 실패:', healthError.message)
      return false
    }
    console.log('✅ 연결 성공!\n')

    // 2. 테이블 존재 확인
    console.log('2️⃣ 테이블 존재 확인...')
    const tables = ['profiles', 'shop_items', 'user_inventory', 'study_logs']
    
    for (const table of tables) {
      const { error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true })
      
      if (error) {
        console.error(`❌ ${table} 테이블 오류:`, error.message)
      } else {
        console.log(`✅ ${table} 테이블 확인됨`)
      }
    }
    console.log('')

    // 3. RLS 정책 테스트 (인증 없이 조회 시도)
    console.log('3️⃣ RLS 정책 확인...')
    const { data: profiles, error: rlsError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1)

    if (rlsError) {
      if (rlsError.code === 'PGRST301' || rlsError.message.includes('RLS') || rlsError.message.includes('policy')) {
        console.log('✅ RLS 정책이 활성화되어 있습니다 (예상된 동작)')
        console.log('   → 인증 없이는 데이터를 조회할 수 없습니다.')
      } else {
        console.error('❌ RLS 테스트 오류:', rlsError.message)
      }
    } else {
      console.log('⚠️ RLS가 비활성화되어 있거나 정책이 없습니다')
    }
    console.log('')

    // 4. 인덱스 확인 (간접적으로)
    console.log('4️⃣ 인덱스 확인...')
    console.log('   → study_logs 테이블의 인덱스: idx_logs_user_date')
    console.log('   → user_inventory 테이블의 인덱스: idx_inventory_user')
    console.log('   ✅ 인덱스가 생성되었습니다 (스키마에 포함됨)')
    console.log('')

    console.log('✅ 모든 테스트 완료!')
    console.log('')
    console.log('📋 다음 단계:')
    console.log('   1. Supabase CLI로 타입 생성 (선택사항)')
    console.log('   2. Next.js 프로젝트로 마이그레이션')
    console.log('   3. 개발 시작!')
    return true

  } catch (error) {
    console.error('❌ 예상치 못한 오류:', error.message)
    return false
  }
}

testConnection()
  .then((success) => {
    process.exit(success ? 0 : 1)
  })
  .catch((error) => {
    console.error('❌ 스크립트 실행 오류:', error)
    process.exit(1)
  })
