# 빠른 시작 가이드

## 1단계: Supabase 프로젝트 생성

### 웹 브라우저에서 진행

1. **Supabase 접속**
   - https://supabase.com 접속
   - GitHub 계정으로 로그인

2. **프로젝트 생성**
   - "New Project" 클릭
   - 프로젝트 이름: `esl-writing-app`
   - 데이터베이스 비밀번호: 강력한 비밀번호 설정 (저장 필수!)
   - Region: `Northeast Asia (Seoul)` 선택
   - Plan: Free 선택

3. **프로젝트 생성 대기** (약 2-3분)

## 2단계: API 키 복사

프로젝트 생성 완료 후:

1. 좌측 메뉴 → **Settings** → **API** 클릭

2. 다음 정보를 복사:
   - **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   - **anon public key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **service_role secret key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (⚠️ 비밀!)

## 3단계: 환경 변수 입력

프로젝트 루트의 `.env.local` 파일을 열고 복사한 값들을 입력:

```env
NEXT_PUBLIC_SUPABASE_URL=여기에_Project_URL_붙여넣기
NEXT_PUBLIC_SUPABASE_ANON_KEY=여기에_anon_key_붙여넣기
SUPABASE_SERVICE_ROLE_KEY=여기에_service_role_key_붙여넣기
```

## 4단계: 익명 인증 활성화 (필수!)

게스트 모드를 사용하려면 익명 인증을 활성화해야 합니다.

1. Supabase 대시보드 → **Authentication** → **Providers** 클릭
2. **Anonymous** 섹션 찾기
3. **Enable Anonymous Sign-ins** 토글을 **ON**으로 변경
4. **Save** 버튼 클릭

⚠️ **중요**: 이 단계를 건너뛰면 게스트 계정 생성이 실패합니다!

## 5단계: 데이터베이스 스키마 적용

### Supabase SQL Editor 사용

1. Supabase 대시보드 → **SQL Editor** 클릭
2. **New query** 클릭
3. 아래 파일 내용을 복사하여 붙여넣기:
   - `supabase/migrations/001_initial_schema.sql`
   - **Run** 버튼 클릭
4. 아래 파일 내용을 복사하여 붙여넣기:
   - `supabase/migrations/002_rls_policies.sql`
   - **Run** 버튼 클릭

✅ 성공 메시지 확인!

## 6단계: 타입 생성

```bash
# 프로젝트 디렉토리로 이동
cd C:\Users\iamyo\english-write-study-app-main

# Supabase CLI 설치 (처음 한 번만)
npm install -g supabase

# 로그인
supabase login

# 프로젝트 링크 (프로젝트 ID는 Supabase 대시보드 URL에서 확인)
supabase link --project-ref your-project-ref

# 타입 생성
supabase gen types typescript --linked > types/database.ts
```

## 7단계: 테스트

```bash
# 개발 서버 실행
npm run dev
```

브라우저에서 http://localhost:3000 접속하여 확인!

## 체크리스트

- [ ] Supabase 프로젝트 생성 완료
- [ ] API 키 복사 완료
- [ ] `.env.local` 파일에 값 입력 완료
- [ ] **익명 인증 활성화 완료** ⚠️ 필수!
- [ ] 데이터베이스 스키마 적용 완료
- [ ] RLS 정책 적용 완료
- [ ] 타입 생성 완료
- [ ] 개발 서버 실행 성공

## 문제 해결

### "Invalid API key" 오류
- `.env.local` 파일의 키가 정확한지 확인
- 개발 서버 재시작

### "RLS policy violation" 오류
- `002_rls_policies.sql`이 실행되었는지 확인
- Supabase 대시보드 → Authentication → Policies 확인

### 타입 생성 실패
- Supabase CLI가 설치되어 있는지 확인
- `supabase login` 실행 확인

## 상세 가이드

더 자세한 내용은 `SUPABASE_PROJECT_SETUP.md` 파일을 참고하세요.
