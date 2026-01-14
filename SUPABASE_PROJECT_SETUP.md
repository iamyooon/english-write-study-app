# Supabase 프로젝트 생성 가이드

## 1. Supabase 프로젝트 생성 (웹 대시보드)

### 단계별 가이드

1. **Supabase 웹사이트 접속**
   - https://supabase.com 접속
   - GitHub 계정으로 로그인 (또는 이메일 가입)

2. **새 프로젝트 생성**
   - 대시보드에서 "New Project" 클릭
   - Organization 선택 (없으면 새로 생성)
   - 프로젝트 정보 입력:
     - **Name**: `esl-writing-app` (또는 원하는 이름)
     - **Database Password**: 강력한 비밀번호 설정 (반드시 저장!)
     - **Region**: `Northeast Asia (Seoul)` 선택 (한국 사용자용)
     - **Pricing Plan**: Free tier 선택

3. **프로젝트 생성 대기**
   - 약 2-3분 소요
   - "Setting up your project..." 메시지 확인

4. **프로젝트 정보 확인**
   - 프로젝트가 생성되면 대시보드로 이동
   - 좌측 메뉴에서 "Settings" → "API" 클릭

## 2. API 키 및 URL 복사

### 필요한 정보

1. **Project URL**
   - Settings → API → Project URL
   - 예: `https://xxxxxxxxxxxxx.supabase.co`

2. **anon/public key**
   - Settings → API → Project API keys → `anon` `public`
   - 클라이언트 사이드에서 사용

3. **service_role key**
   - Settings → API → Project API keys → `service_role` `secret`
   - ⚠️ **절대 클라이언트에 노출하지 마세요!** 서버 사이드 전용

## 3. 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 내용을 입력하세요:

```env
# Supabase 설정
NEXT_PUBLIC_SUPABASE_URL=여기에_Project_URL_입력
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_anon_key_입력
SUPABASE_SERVICE_ROLE_KEY=여기에_service_role_key_입력

# OpenAI 설정 (기존 키 사용)
OPENAI_API_KEY=sk-your-openai-api-key

# RevenueCat 설정 (나중에 설정 가능)
REVENUECAT_API_KEY=

# Firebase 설정 (나중에 설정 가능)
FIREBASE_PROJECT_ID=
FIREBASE_PRIVATE_KEY=
FIREBASE_CLIENT_EMAIL=

# Next.js 앱 설정
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. 익명 인증 활성화 (필수!)

게스트 모드를 사용하려면 익명 인증을 활성화해야 합니다.

1. Supabase 대시보드 → **Authentication** → **Providers** 이동
2. **Anonymous** 섹션 찾기
3. **Enable Anonymous Sign-ins** 토글을 **ON**으로 변경
4. **Save** 버튼 클릭

⚠️ **중요**: 이 단계를 건너뛰면 게스트 계정 생성이 실패합니다!

## 5. 데이터베이스 스키마 적용

### 방법 A: SQL Editor 사용 (권장)

1. Supabase 대시보드 → SQL Editor 이동
2. "New query" 클릭
3. `supabase/migrations/001_initial_schema.sql` 파일 내용 복사하여 붙여넣기
4. "Run" 버튼 클릭
5. `supabase/migrations/002_rls_policies.sql` 파일 내용 복사하여 붙여넣기
6. "Run" 버튼 클릭

### 방법 B: Supabase CLI 사용

```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 링크
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push
```

## 6. 타입 자동 생성

```bash
# 프로덕션 환경에서 타입 생성
npx supabase gen types typescript --project-id your-project-id > types/database.ts
```

또는 Supabase CLI 사용:

```bash
# 프로젝트 링크 후
supabase gen types typescript --linked > types/database.ts
```

## 7. 연결 테스트

간단한 테스트 스크립트로 연결을 확인할 수 있습니다:

```typescript
// test-supabase.ts
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

async function test() {
  const { data, error } = await supabase.from('profiles').select('count')
  console.log('Connection test:', error ? 'Failed' : 'Success')
  if (error) console.error(error)
}

test()
```

## 문제 해결

### 환경 변수가 인식되지 않는 경우

1. `.env.local` 파일이 프로젝트 루트에 있는지 확인
2. Next.js 개발 서버 재시작 (`npm run dev`)
3. 파일 이름이 정확한지 확인 (`.env.local`)

### RLS 정책 오류

- 모든 테이블에 RLS가 활성화되어 있어야 합니다
- `002_rls_policies.sql`이 실행되었는지 확인

### 타입 생성 오류

- Supabase CLI가 설치되어 있는지 확인
- 프로젝트 ID가 정확한지 확인
- 네트워크 연결 확인

## 다음 단계

1. ✅ Supabase 프로젝트 생성 완료
2. ✅ 환경 변수 설정 완료
3. ⏭️ 데이터베이스 스키마 적용
4. ⏭️ 타입 자동 생성
5. ⏭️ 연결 테스트
