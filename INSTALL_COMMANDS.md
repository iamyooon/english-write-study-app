# ESL Writing App - 설치 명령어 가이드

## 1. Next.js 마이그레이션 (현재 Vite 프로젝트에서 전환)

### 옵션 A: 현재 프로젝트를 Next.js로 전환

```bash
# 1. 현재 의존성 백업
cp package.json package.json.backup

# 2. Next.js 및 필수 의존성 설치
npm install next@latest react@latest react-dom@latest

# 3. Supabase 클라이언트 설치
npm install @supabase/supabase-js @supabase/ssr

# 4. OpenAI SDK 설치
npm install openai

# 5. PWA 지원 (next-pwa)
npm install next-pwa

# 6. RevenueCat SDK (결제)
npm install revenuecat

# 7. Firebase (FCM 알림)
npm install firebase firebase-admin

# 8. 유틸리티 라이브러리
npm install zod date-fns recharts react-dropzone react-hot-toast

# 9. 개발 의존성
npm install -D @types/node @supabase/cli eslint eslint-config-next
```

### 옵션 B: 새 Next.js 프로젝트 생성 후 파일 이전

```bash
# 1. 새 Next.js 프로젝트 생성
npx create-next-app@latest esl-writing-app --typescript --tailwind --app --no-src-dir

# 2. 프로젝트 디렉토리로 이동
cd esl-writing-app

# 3. 필수 의존성 설치 (위 옵션 A의 3-9번 명령어 실행)
```

## 2. Supabase 설정

```bash
# Supabase CLI 설치 (전역)
npm install -g supabase

# Supabase 로컬 개발 환경 초기화
supabase init

# Supabase 로컬 시작
supabase start

# 타입 자동 생성 (로컬)
npx supabase gen types typescript --local > types/database.ts

# 또는 프로덕션에서
npx supabase gen types typescript --project-id <your-project-id> > types/database.ts
```

## 3. 환경 변수 설정

`.env.local` 파일 생성:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# RevenueCat
REVENUECAT_API_KEY=your-revenuecat-api-key

# Firebase (FCM)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 4. 프로젝트 구조 생성

```bash
# 주요 디렉토리 생성
mkdir -p app/{api/{auth,writing/{submit,feedback,moderation},queue,report,payment},\(auth\)/{login,signup},\(guest\)/onboarding,\(main\)/{writing,library,report,shop,character}}
mkdir -p components/{ui,writing,feedback,onboarding,report,gamification}
mkdir -p lib/{supabase,openai,safety,queue,payment,notifications}
mkdir -p types
mkdir -p hooks
mkdir -p supabase/migrations
mkdir -p public/icons
```

## 5. Next.js 설정 파일 생성

### next.config.js

```javascript
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['your-supabase-project.supabase.co'],
  },
}

module.exports = withPWA(nextConfig)
```

### tsconfig.json (Next.js용)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

## 6. 전체 설치 명령어 (한 번에 실행)

```bash
# 필수 의존성
npm install next@latest react@latest react-dom@latest @supabase/supabase-js @supabase/ssr openai next-pwa revenuecat firebase firebase-admin zod date-fns recharts react-dropzone react-hot-toast

# 개발 의존성
npm install -D @types/node @supabase/cli eslint eslint-config-next typescript tailwindcss postcss autoprefixer

# Supabase CLI (전역)
npm install -g supabase

# 프로젝트 초기화
supabase init
```

## 7. 확인 사항

- [ ] `package.json`에 모든 의존성이 추가되었는지 확인
- [ ] `.env.local` 파일이 생성되고 환경 변수가 설정되었는지 확인
- [ ] `types/database.ts` 파일이 생성되었는지 확인 (Supabase 타입)
- [ ] Next.js 개발 서버가 실행되는지 확인: `npm run dev`
