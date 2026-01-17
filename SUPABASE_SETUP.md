# Supabase 설정 가이드

## 완료된 작업

### 1. 타입 정의
- ✅ `types/database.ts` - 실제 스키마(`docs/02_schema.sql`)에 맞춘 완벽한 타입 정의

### 2. Supabase 클라이언트 유틸리티
- ✅ `lib/supabase/client.ts` - 클라이언트 사이드용
- ✅ `lib/supabase/server.ts` - 서버 사이드용 (Server Components, Server Actions, API Routes)
- ✅ `lib/supabase/middleware.ts` - Next.js Middleware용
- ✅ `lib/supabase/utils.ts` - 자주 사용하는 쿼리 패턴 유틸리티

### 3. 데이터베이스 마이그레이션
- ✅ `supabase/migrations/001_initial_schema.sql` - 초기 스키마
- ✅ `supabase/migrations/002_rls_policies.sql` - RLS 보안 정책

### 4. Next.js 설정
- ✅ `middleware.ts` - 세션 관리 및 라우트 보호

## 다음 단계

### 1. Supabase 프로젝트 생성

1. [Supabase](https://supabase.com)에 로그인
2. 새 프로젝트 생성
3. 프로젝트 URL과 Anon Key 복사

### 2. 환경 변수 설정

`.env.local` 파일 생성:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. 데이터베이스 스키마 적용

**방법 A: Supabase SQL Editor 사용**

1. Supabase 대시보드 → SQL Editor 이동
2. `supabase/migrations/001_initial_schema.sql` 내용 복사하여 실행
3. `supabase/migrations/002_rls_policies.sql` 내용 복사하여 실행

**방법 B: Supabase CLI 사용**

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

### 5. 타입 자동 생성

```bash
# 로컬 개발 환경
npx supabase gen types typescript --local > types/database.ts

# 프로덕션 환경
npx supabase gen types typescript --project-id your-project-id > types/database.ts
```

### 5. 테스트

```bash
# 개발 서버 실행
npm run dev

# 타입 체크
npm run type-check
```

## 사용 예제

### 클라이언트 컴포넌트

```tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function Profile() {
  const [profile, setProfile] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
    }
    load()
  }, [])

  return <div>{profile?.grade}학년</div>
}
```

### 서버 컴포넌트

```tsx
import { getProfile } from '@/lib/supabase/server'

export default async function Profile() {
  const profile = await getProfile()
  
  if (!profile) {
    return <div>로그인이 필요합니다</div>
  }

  return <div>{profile.grade}학년, 에너지: {profile.energy}</div>
}
```

### Server Action

```tsx
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitWriting(userInput: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('로그인이 필요합니다')
  }

  const { data, error } = await supabase
    .from('study_logs')
    .insert({
      user_id: user.id,
      user_input: userInput,
      status: 'queued',
    })

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/library')
  return data
}
```

## 보안 체크리스트

- [x] 모든 테이블에 RLS 활성화
- [x] 사용자는 자신의 데이터만 접근 가능하도록 정책 설정
- [x] Service Role Key는 서버 사이드에서만 사용
- [x] 환경 변수는 `.env.local`에 저장 (Git에 커밋하지 않음)

## 참고 문서

- `lib/supabase/README.md` - 상세한 사용 가이드
- `docs/02_schema.sql` - 데이터베이스 스키마
- `docs/03_design.md` - 시스템 설계 문서
- `docs/spec.md` - 프로젝트 스펙 요약
