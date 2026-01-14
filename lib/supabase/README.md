# Supabase 유틸리티 가이드

## 파일 구조

- `client.ts` - 클라이언트 사이드용 Supabase 클라이언트
- `server.ts` - 서버 사이드용 Supabase 클라이언트 및 헬퍼 함수
- `middleware.ts` - Next.js Middleware용 Supabase 클라이언트
- `utils.ts` - 자주 사용하는 쿼리 패턴 유틸리티 함수

## 사용 방법

### 클라이언트 컴포넌트에서 사용

```tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function ClientComponent() {
  const [profile, setProfile] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
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
    fetchProfile()
  }, [])

  return <div>{/* ... */}</div>
}
```

### 서버 컴포넌트에서 사용

```tsx
import { getProfile } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const profile = await getProfile()

  if (!profile) {
    return <div>Not logged in</div>
  }

  return <div>Welcome, {profile.grade}학년!</div>
}
```

### Server Action에서 사용

```tsx
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitWriting(userInput: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('study_logs')
    .insert({
      user_id: user.id,
      user_input: userInput,
      status: 'queued',
    })
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/library')
  return data
}
```

### API Route에서 사용

```tsx
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return NextResponse.json(data)
}
```

### 유틸리티 함수 사용

```tsx
import { consumeEnergy, getUserStudyLogs, purchaseItem } from '@/lib/supabase/utils'

// 에너지 소모
await consumeEnergy(userId, 1)

// 학습 로그 조회
const logs = await getUserStudyLogs(userId, 20, 0)

// 아이템 구매
await purchaseItem(userId, itemId)
```

## 보안 주의사항

1. **RLS 정책**: 모든 테이블에 RLS가 적용되어 있습니다. 사용자는 자신의 데이터만 접근할 수 있습니다.

2. **Service Role Key**: `createServiceRoleClient()`는 서버 사이드에서만 사용하세요. 절대 클라이언트에 노출하지 마세요!

3. **환경 변수**: `.env.local`에 다음 변수들이 설정되어 있어야 합니다:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (서버 사이드 전용)

## 타입 안정성

모든 Supabase 클라이언트는 `Database` 타입으로 타입이 지정되어 있습니다. 
`types/database.ts`에서 자동 생성된 타입을 사용합니다.

```bash
# 타입 재생성 (스키마 변경 후)
npx supabase gen types typescript --local > types/database.ts
```
