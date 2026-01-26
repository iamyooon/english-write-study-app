# 프로젝트 문서 가이드

이 문서는 Git 저장소에서 관리하는 모든 문서의 종류와 역할을 정리한 가이드입니다.

## 📚 문서 분류 체계

### 1. 프로젝트 개요 및 시작 가이드

#### 📄 `README.md`
- **역할**: 프로젝트의 메인 문서, 첫 진입점
- **내용**: 
  - 프로젝트 소개 및 주요 기능
  - 기술 스택
  - 설치 및 실행 방법
  - 프로젝트 구조 개요
- **대상**: 모든 개발자 및 협업자

#### 📄 `QUICK_START.md`
- **역할**: 빠른 시작 가이드
- **내용**: 최소한의 설정으로 프로젝트를 실행하는 방법
- **대상**: 신규 개발자

#### 📄 `PROJECT_STRUCTURE.md`
- **역할**: 프로젝트 폴더 구조 상세 설명
- **내용**: Next.js App Router 기반의 디렉토리 구조 및 각 폴더의 역할
- **대상**: 개발자

---

### 2. 설정 및 설치 가이드

#### 📄 `SETUP_CHECKLIST.md`
- **역할**: 초기 설정 체크리스트
- **내용**: 개발 환경 구축 시 확인해야 할 항목들
- **대상**: 신규 개발자

#### 📄 `SETUP_GIT.md`
- **역할**: Git 설정 가이드
- **내용**: Git 저장소 초기화 및 기본 설정 방법

#### 📄 `ENV_SETUP_GUIDE.md`
- **역할**: 환경 변수 설정 가이드
- **내용**: `.env` 파일 설정 방법 및 필요한 API 키 목록

#### 📄 `ENV_TEMPLATE.md`
- **역할**: 환경 변수 템플릿
- **내용**: `.env.example` 파일의 상세 설명

#### 📄 `INSTALL_COMMANDS.md`
- **역할**: 설치 명령어 모음
- **내용**: 패키지 설치 및 의존성 관리 명령어

#### 📄 `SETUP_STATUS.md` / `SETUP_SUMMARY.md` / `SETUP_COMPLETE.md`
- **역할**: 설정 진행 상황 추적 문서
- **내용**: 설정 단계별 완료 상태 기록

---

### 3. 서비스별 설정 가이드

#### 📄 `SUPABASE_SETUP.md`
- **역할**: Supabase 초기 설정 가이드
- **내용**: 데이터베이스, 인증, RLS 정책 설정 방법

#### 📄 `SUPABASE_PROJECT_SETUP.md`
- **역할**: Supabase 프로젝트 생성 및 구성 가이드
- **내용**: 프로젝트 생성부터 초기 설정까지

#### 📄 `SUPABASE_ANONYMOUS_AUTH.md`
- **역할**: Supabase 익명 인증 설정 가이드
- **내용**: 게스트 모드를 위한 익명 인증 설정

#### 📄 `OPENAI_SETUP.md`
- **역할**: OpenAI API 설정 가이드
- **내용**: API 키 발급 및 설정 방법

#### 📄 `VERCEL_ENV_SETUP.md`
- **역할**: Vercel 환경 변수 설정 가이드
- **내용**: 배포 환경에서의 환경 변수 설정

#### 📄 `PLACEMENT_TEST_SETUP.md`
- **역할**: Placement Test 설정 가이드
- **내용**: 학년 추천 시스템 설정 방법

---

### 4. 개발 가이드

#### 📄 `ARCHITECTURE_GUIDE.md`
- **역할**: 아키텍처 설계 문서
- **내용**: 
  - 프로젝트 전체 구조
  - 계층 구조 및 데이터 흐름
  - 컴포넌트 구조
  - 서비스 레이어 설계
- **대상**: 개발자, 아키텍트

#### 📄 `COMMIT_GUIDE.md`
- **역할**: Git 커밋 메시지 작성 가이드
- **내용**: 
  - 커밋 메시지 작성 규칙
  - 한글 인코딩 문제 해결
  - 커밋 스크립트 사용법

#### 📄 `LEVEL_DESIGN.md`
- **역할**: 레벨/난이도 설계 문서
- **내용**: 학년별 난이도 설정 및 레벨 시스템 설계

#### 📄 `SECURITY.md`
- **역할**: 보안 가이드
- **내용**: 보안 정책 및 모범 사례

---

### 5. 배포 가이드

#### 📄 `DEPLOY_STEPS.md`
- **역할**: 배포 단계별 가이드
- **내용**: GitHub 및 Vercel 배포 절차

#### 📄 `GITHUB_SETUP.md`
- **역할**: GitHub 저장소 설정 가이드
- **내용**: 저장소 생성 및 초기 설정

#### 📄 `PUSH_GUIDE.md`
- **역할**: Git 푸시 가이드
- **내용**: 코드 푸시 및 브랜치 관리 방법

#### 📄 `REDEPLOY.md`
- **역할**: 재배포 가이드
- **내용**: 배포 실패 시 재배포 절차

---

### 6. 설계 및 기획 문서 (`docs/` 디렉토리)

#### 📄 `docs/spec.md`
- **역할**: 프로젝트 최종 MVP 개발 핸드오버 문서
- **내용**: 
  - 프로젝트 핵심 목표
  - 기술 스택
  - 시스템 설계
  - 개발 로드맵

#### 📄 `docs/03_design.md`
- **역할**: 디자인 문서
- **내용**: UI/UX 설계 및 디자인 가이드라인

#### 📄 `docs/04_prd.md`
- **역할**: 제품 요구사항 문서 (PRD)
- **내용**: 기능 요구사항 및 사용자 스토리

#### 📄 `docs/02_schema.sql`
- **역할**: 데이터베이스 스키마 정의
- **내용**: 테이블 구조 및 관계 정의

---

### 7. 커리큘럼 및 미션 관련 문서 (`docs/curriculum/`)

#### 📄 `docs/curriculum/MISSION_TEMPLATE_SPEC.md`
- **역할**: 미션 템플릿 명세서
- **내용**: 미션 데이터 구조 및 생성 규칙

#### 📄 `docs/curriculum/GRADE_WORD_ALLOCATION.md`
- **역할**: 학년별 단어 할당 가이드
- **내용**: 학년별 어휘 수준 및 단어 분배 전략

#### 📄 `docs/curriculum/UNIT_MISSION_PLAN_SCORED_REBALANCED.md`
- **역할**: 단원별 미션 계획서
- **내용**: 점수 기반 재조정된 단원별 미션 구성

#### 📄 `docs/curriculum/APPLY_GENERATED_MISSIONS.md`
- **역할**: 생성된 미션 적용 가이드
- **내용**: 미션 데이터베이스 적용 방법

#### 📄 `docs/curriculum/*.json`
- **역할**: 커리큘럼 데이터 파일
- **내용**: 
  - `grade_word_allocation*.json`: 학년별 단어 할당 데이터
  - `unit_mission_plan*.json`: 단원별 미션 계획 데이터
  - `word_difficulty*.json`: 단어 난이도 분류 데이터
  - `words_by_grade*.json`: 학년별 단어 목록

---

### 8. 데이터베이스 마이그레이션 (`docs/migrations/`)

#### 📄 `docs/migrations/*.sql`
- **역할**: 데이터베이스 마이그레이션 스크립트
- **내용**: 
  - 테이블 생성/수정 스크립트
  - 시드 데이터 SQL 파일
  - RLS 정책 적용 스크립트
- **예시**:
  - `create_missions_table.sql`: 미션 테이블 생성
  - `seed_keyboard_missions.sql`: 키보드 미션 시드 데이터
  - `seed_generated_missions_*.sql`: 생성된 미션 시드 데이터

---

### 9. 트러블슈팅 가이드

#### 📄 `docs/API_404_TROUBLESHOOTING.md`
- **역할**: API 404 에러 해결 가이드
- **내용**: Next.js API 라우트 404 문제 진단 및 해결

#### 📄 `docs/VERCEL_CRON_TROUBLESHOOTING.md`
- **역할**: Vercel Cron 작업 트러블슈팅
- **내용**: Cron 작업 실패 시 진단 및 해결 방법

#### 📄 `docs/VERCEL_CRON_SETUP.md`
- **역할**: Vercel Cron 설정 가이드
- **내용**: 주기적 작업 설정 방법

#### 📄 `GIT_ENCODING_FIX.md`
- **역할**: Git 한글 인코딩 문제 해결 가이드
- **내용**: 커밋 메시지 한글 깨짐 문제 해결

#### 📄 `docs/TYPES_FIX_GUIDE.md`
- **역할**: TypeScript 타입 오류 해결 가이드
- **내용**: Supabase 타입 생성 및 오류 해결

#### 📄 `docs/TYPES_GENERATION.md`
- **역할**: 타입 생성 가이드
- **내용**: Supabase에서 TypeScript 타입 자동 생성 방법

---

### 10. 개발 진행 상황 문서

#### 📄 `IMPLEMENTATION_STATUS.md`
- **역할**: 구현 상태 추적 문서
- **내용**: 기능별 구현 완료 여부 및 진행 상황

#### 📄 `IMPLEMENTATION_SUMMARY.md`
- **역할**: 구현 요약 문서
- **내용**: 주요 기능 구현 내용 요약

#### 📄 `docs/IMPLEMENTATION_GAPS.md`
- **역할**: 구현 공백 분석 문서
- **내용**: 미구현 기능 및 개선 필요 사항

#### 📄 `NEXT_STEPS.md`
- **역할**: 다음 단계 계획 문서
- **내용**: 향후 개발 계획 및 우선순위

---

### 11. 통합 및 자동화 문서

#### 📄 `docs/JIRA_SETUP_GUIDE.md`
- **역할**: Jira 연동 설정 가이드
- **내용**: Git 커밋과 Jira 이슈 자동 연동 설정

#### 📄 `scripts/README-jira-comment.md`
- **역할**: Jira 코멘트 자동화 가이드
- **내용**: 커밋 후 Jira 코멘트 자동 추가 방법

#### 📄 `scripts/README-commit-message.md`
- **역할**: 커밋 메시지 자동화 가이드
- **내용**: 커밋 메시지 생성 및 테스트 결과 포함 방법

---

### 12. 템플릿 파일

#### 📄 `.git-commit-template.txt`
- **역할**: Git 커밋 메시지 템플릿
- **내용**: 커밋 메시지 작성 시 참고할 템플릿

#### 📄 `jira-comment-template.txt`
- **역할**: Jira 코멘트 템플릿
- **내용**: Jira 이슈에 자동으로 추가될 코멘트 형식

#### 📄 `commit-message.txt`
- **역할**: 커밋 메시지 임시 파일
- **내용**: 커밋 시 사용할 메시지를 작성하는 임시 파일

---

### 13. 라이브러리별 문서

#### 📄 `lib/supabase/README.md`
- **역할**: Supabase 유틸리티 라이브러리 문서
- **내용**: Supabase 클라이언트 사용법 및 유틸리티 함수 설명

---

## 📋 문서 관리 원칙

### 1. 문서 업데이트 규칙
- 코드 변경 시 관련 문서도 함께 업데이트
- Git 커밋 시 문서 변경사항도 포함
- 주요 기능 추가/변경 시 `IMPLEMENTATION_STATUS.md` 업데이트

### 2. 문서 작성 가이드
- 명확하고 간결한 설명
- 코드 예제 포함
- 단계별 가이드 제공
- 트러블슈팅 섹션 포함 (필요 시)

### 3. 문서 버전 관리
- 모든 문서는 Git으로 버전 관리
- 변경 이력은 Git 히스토리로 추적
- 중요한 변경사항은 문서 상단에 날짜 기록

### 4. 문서 접근성
- `README.md`에서 주요 문서로 링크 제공
- 관련 문서 간 상호 참조 링크
- 카테고리별로 디렉토리 구조화

---

## 🔍 문서 찾기 가이드

### 초기 설정이 필요할 때
→ `SETUP_CHECKLIST.md` → `ENV_SETUP_GUIDE.md` → 서비스별 설정 가이드

### 개발 시작할 때
→ `QUICK_START.md` → `PROJECT_STRUCTURE.md` → `ARCHITECTURE_GUIDE.md`

### 배포할 때
→ `DEPLOY_STEPS.md` → `VERCEL_ENV_SETUP.md` → `REDEPLOY.md`

### 문제가 발생했을 때
→ 트러블슈팅 가이드 섹션의 관련 문서 확인

### 커리큘럼/미션 관련 작업 시
→ `docs/curriculum/` 디렉토리의 문서들

### 데이터베이스 작업 시
→ `docs/migrations/` 디렉토리의 SQL 파일들

---

## 📝 문서 추가 시 체크리스트

새 문서를 추가할 때:
- [ ] 적절한 카테고리에 배치
- [ ] `README.md`에 링크 추가 (필요 시)
- [ ] 관련 문서와 상호 참조 링크 추가
- [ ] 명확한 제목과 목차 작성
- [ ] 코드 예제 및 스크린샷 포함 (필요 시)
- [ ] 마지막 업데이트 날짜 기록

---

**마지막 업데이트**: 2026년 1월 26일
