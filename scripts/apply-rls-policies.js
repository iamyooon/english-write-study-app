/**
 * RLS 정책 적용 스크립트
 * 
 * Service Role Key를 사용하여 SQL을 실행합니다.
 * 
 * 실행 방법:
 * node scripts/apply-rls-policies.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { resolve } from 'path'
import { readFileSync } from 'fs'

// .env.local 파일 로드
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
  console.error('SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '✅' : '❌')
  process.exit(1)
}

// Service Role Key를 사용하여 클라이언트 생성 (RLS 우회)
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function applyRLSPolicies() {
  console.log('🔒 RLS 정책 적용 시작...\n')

  try {
    // SQL 파일 읽기
    const sqlPath = resolve(process.cwd(), 'supabase/migrations/002_rls_policies.sql')
    const sql = readFileSync(sqlPath, 'utf-8')

    // SQL을 개별 명령어로 분리 (세미콜론 기준)
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))

    console.log(`📝 ${statements.length}개의 SQL 명령어를 실행합니다...\n`)

    // 각 SQL 명령어 실행
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      // 주석 제거
      const cleanStatement = statement
        .split('\n')
        .filter(line => !line.trim().startsWith('--'))
        .join('\n')
        .trim()

      if (!cleanStatement) continue

      try {
        // Supabase는 직접 SQL 실행 API를 제공하지 않으므로
        // rpc 함수를 사용하거나 Management API를 사용해야 합니다.
        // 하지만 일반적인 방법은 Supabase CLI를 사용하는 것입니다.
        
        console.log(`⚠️  직접 SQL 실행은 Supabase API를 통해 불가능합니다.`)
        console.log(`📋 대신 다음 방법을 사용하세요:\n`)
        console.log(`1. Supabase 대시보드에서 직접 실행:`)
        console.log(`   - https://supabase.com/dashboard/project/ilgwjhtjdaghgwapwcki`)
        console.log(`   - SQL Editor → New query`)
        console.log(`   - supabase/migrations/002_rls_policies.sql 내용 붙여넣기`)
        console.log(`   - Run 버튼 클릭\n`)
        console.log(`2. Supabase CLI 사용:`)
        console.log(`   npm install -g supabase`)
        console.log(`   supabase login`)
        console.log(`   supabase link --project-ref ilgwjhtjdaghgwapwcki`)
        console.log(`   supabase db push\n`)
        
        break
      } catch (error) {
        console.error(`❌ 명령어 ${i + 1} 실행 실패:`, error.message)
      }
    }

    return false

  } catch (error) {
    console.error('❌ 스크립트 실행 오류:', error.message)
    return false
  }
}

// 대신 Supabase Management API를 사용하는 방법 시도
async function tryManagementAPI() {
  console.log('\n🔍 Supabase Management API를 통한 실행 시도...\n')
  
  // Supabase Management API는 인증이 필요하며, 
  // 일반적으로는 Supabase CLI나 대시보드를 사용하는 것이 권장됩니다.
  
  console.log('⚠️  Supabase는 보안상의 이유로 REST API를 통한 직접 SQL 실행을 제한합니다.')
  console.log('✅ 가장 안전한 방법은 Supabase 대시보드의 SQL Editor를 사용하는 것입니다.\n')
  
  return false
}

// 실행
applyRLSPolicies()
  .then(() => tryManagementAPI())
  .then(() => {
    console.log('\n💡 권장 방법: Supabase 대시보드에서 직접 실행하세요.')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ 오류:', error)
    process.exit(1)
  })
