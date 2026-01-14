# ESL Writing App - 설정 완료 요약

## 생성된 파일 목록

### 1. 프로젝트 구조 문서
- `PROJECT_STRUCTURE.md` - 전체 폴더 구조 및 설명

### 2. 타입 정의 파일
- `types/database.ts` - Supabase 데이터베이스 타입 정의
- `types/user.ts` - 사용자 관련 타입
- `types/writing.ts` - Writing 관련 타입
- `types/feedback.ts` - 피드백 관련 타입
- `types/gamification.ts` - 게이미피케이션 타입
- `types/payment.ts` - 결제 관련 타입

### 3. 설정 파일 예제
- `package.json.nextjs` - Next.js용 package.json (참고용)
- `next.config.js.example` - Next.js 설정 파일 예제
- `middleware.ts.example` - Next.js 미들웨어 예제
- `ENV_TEMPLATE.md` - 환경 변수 템플릿

### 4. 데이터베이스 마이그레이션
- `supabase/migrations/001_initial_schema.sql.example` - 초기 스키마
- `supabase/migrations/002_rls_policies.sql.example` - RLS 정책

### 5. 설치 가이드
- `INSTALL_COMMANDS.md` - 상세한 설치 명령어 가이드

## 다음 단계

### 1. Next.js 마이그레이션 결정
현재 프로젝트는 Vite 기반입니다. Next.js로 전환하려면:

**옵션 A: 현재 프로젝트 전환**
```bash
# INSTALL_COMMANDS.md의 "옵션 A" 참고
```

**옵션 B: 새 프로젝트 생성**
```bash
# INSTALL_COMMANDS.md의 "옵션 B" 참고
```

### 2. 의존성 설치
```bash
# 필수 의존성
npm install next@latest react@latest react-dom@latest @supabase/supabase-js @supabase/ssr openai next-pwa revenuecat firebase firebase-admin zod date-fns recharts react-dropzone react-hot-toast

# 개발 의존성
npm install -D @types/node @supabase/cli eslint eslint-config-next
```

### 3. Supabase 설정
```bash
# Supabase CLI 설치 (전역)
npm install -g supabase

# 프로젝트 초기화
supabase init

# 로컬 개발 환경 시작
supabase start

# 타입 자동 생성
npx supabase gen types typescript --local > types/database.ts
```

### 4. 환경 변수 설정
`.env.local` 파일을 생성하고 `ENV_TEMPLATE.md`의 내용을 복사하여 실제 값으로 채우세요.

### 5. 설정 파일 복사
```bash
# Next.js 설정
cp next.config.js.example next.config.js

# 미들웨어
cp middleware.ts.example middleware.ts

# 환경 변수 (값은 직접 입력)
# ENV_TEMPLATE.md 참고하여 .env.local 생성
```

### 6. 데이터베이스 스키마 적용
Supabase 대시보드의 SQL Editor에서:
1. `supabase/migrations/001_initial_schema.sql.example` 실행
2. `supabase/migrations/002_rls_policies.sql.example` 실행

또는 Supabase CLI 사용:
```bash
supabase migration up
```

### 7. 프로젝트 구조 생성
```bash
# 주요 디렉토리 생성 (Windows PowerShell)
New-Item -ItemType Directory -Force -Path app/api/auth,app/api/writing/submit,app/api/writing/feedback,app/api/writing/moderation,app/api/queue,app/api/report,app/api/payment
New-Item -ItemType Directory -Force -Path app/(auth)/login,app/(auth)/signup
New-Item -ItemType Directory -Force -Path app/(guest)/onboarding
New-Item -ItemType Directory -Force -Path app/(main)/writing,app/(main)/library,app/(main)/report,app/(main)/shop,app/(main)/character
New-Item -ItemType Directory -Force -Path components/ui,components/writing,components/feedback,components/onboarding,components/report,components/gamification
New-Item -ItemType Directory -Force -Path lib/supabase,lib/openai,lib/safety,lib/queue,lib/payment,lib/notifications
New-Item -ItemType Directory -Force -Path hooks,public/icons
```

### 8. 개발 서버 실행
```bash
npm run dev
```

## 중요 사항

1. **보안**: `.env.local` 파일은 절대 Git에 커밋하지 마세요. `.gitignore`에 추가되어 있는지 확인하세요.

2. **RLS 정책**: 모든 테이블에 Row Level Security가 적용되어야 합니다. `002_rls_policies.sql.example`를 반드시 실행하세요.

3. **타입 생성**: Supabase 스키마 변경 시마다 타입을 재생성하세요:
   ```bash
   npx supabase gen types typescript --local > types/database.ts
   ```

4. **PWA**: `next-pwa`는 프로덕션 빌드에서만 활성화됩니다. 개발 환경에서는 비활성화되어 있습니다.

5. **테스트**: 기존 테스트 파일들은 Next.js 구조에 맞게 수정이 필요할 수 있습니다.

## 참고 문서

- `PROJECT_STRUCTURE.md` - 전체 프로젝트 구조
- `INSTALL_COMMANDS.md` - 상세 설치 가이드
- `docs/spec.md` - 프로젝트 스펙 문서
