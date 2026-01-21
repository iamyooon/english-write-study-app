# Vercel 환경 변수 설정 가이드

## 필수 환경 변수

이 프로젝트는 다음 환경 변수가 필요합니다:

1. **Supabase 환경 변수** (필수)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

2. **OpenAI API 키** (선택)
   - `OPENAI_API_KEY`

## Supabase 환경 변수 설정 방법

### 1. Supabase 프로젝트에서 API 키 확인

1. Supabase 대시보드 접속: https://supabase.com/dashboard
2. 프로젝트 선택
3. **Settings** → **API** 메뉴 클릭
4. 다음 정보를 확인:
   - **Project URL**: `NEXT_PUBLIC_SUPABASE_URL` 값
   - **anon public** 키: `NEXT_PUBLIC_SUPABASE_ANON_KEY` 값

### 2. Vercel에 환경 변수 추가

1. Vercel 대시보드 접속: https://vercel.com/dashboard
2. 프로젝트 선택: `english-write-study-app`
3. **Settings** 탭 클릭
4. 왼쪽 메뉴에서 **Environment Variables** 클릭
5. 다음 환경 변수를 추가:

   **첫 번째 환경 변수:**
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: Supabase 프로젝트의 Project URL (예: `https://xxxxx.supabase.co`)
   - **Environment**: Production, Preview, Development 모두 선택
   - **Add** 클릭

   **두 번째 환경 변수:**
   - **Key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: Supabase 프로젝트의 anon public 키
   - **Environment**: Production, Preview, Development 모두 선택
   - **Add** 클릭

6. 모든 환경 변수 추가 후 **Save** 클릭
7. **Deployments** 탭으로 이동하여 최신 배포의 **⋯** 메뉴 → **Redeploy** 클릭

## OpenAI API 키 설정 방법 (선택)

1. Vercel 대시보드 접속: https://vercel.com/dashboard
2. 프로젝트 선택: `english-write-study-app`
3. **Settings** 탭 클릭
4. 왼쪽 메뉴에서 **Environment Variables** 클릭
5. 환경 변수 추가:
   - **Key**: `OPENAI_API_KEY`
   - **Value**: 본인의 OpenAI API 키
   - **Environment**: Production, Preview, Development 모두 선택 (또는 필요에 따라 선택)
6. **Save** 클릭
7. **Redeploy** 버튼을 클릭하여 환경 변수를 적용합니다

## OpenAI API 키 발급 방법

1. https://platform.openai.com/api-keys 방문
2. 계정 생성 또는 로그인
3. "Create new secret key" 클릭
4. 키 이름 입력 (예: "english-write-study-app")
5. 생성된 키 복사 (한 번만 표시되므로 안전하게 보관)

## 주의사항

- API 키는 절대 공개 저장소에 커밋하지 마세요
- Vercel의 환경 변수 설정을 사용하면 안전하게 API 키를 관리할 수 있습니다
- 환경 변수 변경 후에는 **반드시 재배포**가 필요합니다
- `NEXT_PUBLIC_` 접두사가 붙은 환경 변수는 클라이언트 사이드에서 접근 가능합니다

