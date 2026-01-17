/**
 * Supabase 타입 생성 스크립트
 * 
 * 실행 방법:
 * node scripts/generate-types.js
 * 
 * 또는 Supabase CLI 사용:
 * npx supabase gen types typescript --project-id ilgwjhtjdaghgwapwcki > types/database.ts
 */

const https = require('https')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

const projectId = 'ilgwjhtjdaghgwapwcki'
const accessToken = process.env.SUPABASE_ACCESS_TOKEN || ''

// Supabase CLI를 사용하는 것이 더 안전하지만, 
// 직접 API를 호출하는 방법도 있습니다.
// 대신 Supabase CLI 사용을 권장합니다.

console.log('📝 Supabase 타입 생성')
console.log('')
console.log('방법 1: Supabase CLI 사용 (권장)')
console.log('  npm install -g supabase')
console.log('  supabase login')
console.log(`  npx supabase gen types typescript --project-id ${projectId} > types/database.ts`)
console.log('')
console.log('방법 2: 수동으로 types/database.ts 파일 확인')
console.log('  현재 types/database.ts 파일이 이미 생성되어 있습니다.')
console.log('  스키마가 변경되면 타입을 재생성하세요.')
console.log('')
