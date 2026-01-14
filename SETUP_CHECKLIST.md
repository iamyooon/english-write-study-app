# Supabase 초기 설정 체크리스트

## 필수 단계 (순서대로 진행)

### 1. Supabase 프로젝트 생성
- [ ] Supabase 대시보드에서 새 프로젝트 생성
- [ ] Project URL 복사
- [ ] anon public key 복사
- [ ] service_role secret key 복사

### 2. 환경 변수 설정
- [ ] `.env.local` 파일 생성
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 입력
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 입력
- [ ] `SUPABASE_SERVICE_ROLE_KEY` 입력
- [ ] `OPENAI_API_KEY` 입력 (기존 키 사용)

### 3. 익명 인증 활성화 ⚠️ 필수!
- [ ] Supabase 대시보드 → Authentication → Providers 이동
- [ ] Anonymous 섹션 찾기
- [ ] Enable Anonymous Sign-ins 토글을 ON으로 변경
- [ ] Save 버튼 클릭

**중요**: 이 단계를 건너뛰면 게스트 계정 생성이 실패합니다!

### 4. 데이터베이스 스키마 적용
- [ ] SQL Editor 열기
- [ ] `supabase/migrations/001_initial_schema.sql` 실행
- [ ] `supabase/migrations/002_rls_policies.sql` 실행
- [ ] 테이블 생성 확인 (Table Editor에서 확인)

### 5. RLS 정책 확인
- [ ] 연결 테스트 실행: `node scripts/test-supabase-connection.js`
- [ ] RLS 정책이 제대로 적용되었는지 확인
- [ ] 필요시 `supabase/migrations/002_rls_policies.sql` 재실행

### 6. 타입 생성 (선택사항)
- [ ] `types/database.ts` 파일 확인
- [ ] 필요시 타입 재생성

### 7. 개발 서버 실행
- [ ] `npm run dev` 실행
- [ ] http://localhost:3000 접속 확인
- [ ] 게스트 모드 테스트 (온보딩 → Writing)

## 문제 해결

### 게스트 계정 생성 실패
- ✅ 익명 인증이 활성화되어 있는지 확인
- ✅ 환경 변수가 올바르게 설정되었는지 확인
- ✅ 서버 콘솔에서 에러 메시지 확인

### RLS 정책 오류
- ✅ `002_rls_policies.sql`이 실행되었는지 확인
- ✅ 정책이 중복되지 않도록 DROP POLICY IF EXISTS 사용

### 연결 오류
- ✅ `.env.local` 파일이 프로젝트 루트에 있는지 확인
- ✅ 환경 변수 이름이 정확한지 확인
- ✅ 개발 서버 재시작

## 참고 문서

- `SUPABASE_PROJECT_SETUP.md` - 상세 설정 가이드
- `QUICK_START.md` - 빠른 시작 가이드
- `SUPABASE_ANONYMOUS_AUTH.md` - 익명 인증 가이드
- `SUPABASE_SETUP.md` - Supabase 설정 가이드
