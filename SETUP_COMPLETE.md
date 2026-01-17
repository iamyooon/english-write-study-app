# Supabase 설정 완료 체크리스트

## ✅ 완료된 작업

- [x] Supabase 프로젝트 생성
- [x] 환경 변수 설정 (`.env.local`)
- [x] **익명 인증 활성화** ⚠️ 필수!
- [x] 데이터베이스 스키마 적용
- [x] 연결 테스트 성공
- [x] 테이블 생성 확인:
  - ✅ profiles
  - ✅ shop_items
  - ✅ user_inventory
  - ✅ study_logs

## ⚠️ 확인 필요: RLS 정책

연결 테스트에서 RLS 정책이 제대로 적용되지 않은 것으로 보입니다.

### RLS 정책 재적용 방법

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard/project/ilgwjhtjdaghgwapwcki

2. **SQL Editor 열기**
   - 좌측 메뉴 → SQL Editor

3. **RLS 정책 SQL 실행**
   - `supabase/migrations/002_rls_policies.sql` 파일 내용 복사
   - SQL Editor에 붙여넣기
   - **Run** 버튼 클릭

4. **정책 확인**
   - Settings → Authentication → Policies
   - 각 테이블에 정책이 생성되었는지 확인

### RLS 정책 확인 명령어

다시 연결 테스트를 실행하여 RLS가 제대로 적용되었는지 확인:

```bash
node scripts/test-supabase-connection.js
```

RLS가 제대로 적용되면 "✅ RLS 정책이 활성화되어 있습니다" 메시지가 표시됩니다.

## 📋 다음 단계

### 1. 타입 생성 (선택사항)

현재 `types/database.ts` 파일이 이미 생성되어 있지만, 
Supabase CLI를 사용하여 최신 타입을 생성할 수 있습니다:

```bash
# Supabase CLI 설치
npm install -g supabase

# 로그인
supabase login

# 프로젝트 링크
supabase link --project-ref ilgwjhtjdaghgwapwcki

# 타입 생성
supabase gen types typescript --linked > types/database.ts
```

### 2. Next.js 마이그레이션

현재 프로젝트는 Vite 기반입니다. Next.js로 마이그레이션하려면:

1. `INSTALL_COMMANDS.md` 참고
2. `package.json.nextjs`를 참고하여 의존성 설치
3. 프로젝트 구조 변경 (`PROJECT_STRUCTURE.md` 참고)

### 3. 개발 시작

- `lib/supabase/` 폴더의 유틸리티 함수 사용
- `SUPABASE_SETUP.md` 참고하여 개발 진행

## 🔒 보안 체크리스트

- [x] `.env.local` 파일이 `.gitignore`에 포함됨
- [ ] RLS 정책이 모든 테이블에 적용됨
- [ ] Service Role Key가 서버 사이드에서만 사용됨
- [ ] 환경 변수가 Git에 커밋되지 않음

## 📚 참고 문서

- `SUPABASE_SETUP.md` - Supabase 설정 가이드
- `SUPABASE_PROJECT_SETUP.md` - 프로젝트 생성 가이드
- `lib/supabase/README.md` - Supabase 유틸리티 사용법
- `QUICK_START.md` - 빠른 시작 가이드
