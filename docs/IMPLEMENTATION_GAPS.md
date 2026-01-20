# 03_design.md 기준 미구현 항목 체크리스트

**작성일**: 2026년 1월 17일  
**기준 문서**: `docs/03_design.md` (v2.1)

---

## ✅ 구현 완료된 기능

### 1. Placement Test 시스템
- ✅ 온보딩 후 즉시 실행 (Guest Mode 포함)
- ✅ 5~7문항 처리 (`/api/placement/questions`)
- ✅ GPT-4o로 점수 평가 (`/api/placement/submit`)
- ✅ 결과 저장: `profiles.placement_level` 업데이트
- ✅ UI: 진행바 + 격려 문구 (`/placement`)
- ✅ **보안**: OpenAI Moderation 검사 추가됨

### 2. 기본 인프라
- ✅ Next.js 14+ (App Router)
- ✅ Supabase 연동 (RLS 적용)
- ✅ OpenAI API 연동 (GPT-4o)
- ✅ Guest Mode 온보딩 (`/onboarding`)
- ✅ 기본 Writing 루프 (`/writing`)

### 3. 기본 미션 흐름
- ✅ 미션 제시 (한글 문장 생성)
- ✅ 어휘 노출 UI (주요 단어 3-5개 표시)
- ✅ 예시 문장 표시 UI (영어 예시 문장)
- ✅ 작성 (영어 입력)
- ✅ LLM 피드백
- ✅ `/api/study/generate-mission` API 확장 (vocabulary, example 포함)

### 4. 보안
- ✅ 3중 안전 필터링 (클라이언트 금칙어 → OpenAI Moderation → AI Persona)
- ✅ Placement Test 답변도 Moderation 경유

---

## ❌ 미구현 기능 (우선순위별)

### 🔴 Phase 1: 핵심 기능 (즉시 구현 필요)

#### 1. 에너지 시스템 (✅ 구현 완료)
**설계 요구사항:**
- 매일 100 충전 (자정 기준)
- 미션 1회당 100 소비
- 작성 문장당 +10 생산
- 부족 시 카운트다운 UI
- 시각화: 홈 화면 에너지 게이지

**현재 상태:**
- ✅ `profiles.energy` 기본값을 100으로 변경 (마이그레이션 `004_add_energy_system.sql`)
- ✅ `profiles.energy_last_charged` 컬럼 추가
- ✅ 자정 에너지 자동 충전 API 엔드포인트 (`/api/energy/charge-daily`)
- ✅ 미션 제출 시 에너지 소비 로직 추가 (`/api/study/submit` - 미션 1회당 100 소비)
- ✅ 작성 문장당 에너지 생산 로직 추가 (미션 완료 시 +10)
- ✅ 에너지 부족 시 카운트다운 UI 컴포넌트 (`components/EnergyCountdown.tsx`)
- ✅ 홈 화면 에너지 게이지 (`components/EnergyGauge.tsx` + `app/page.tsx`)

**구현 완료:**
- ✅ 데이터베이스 마이그레이션 (`supabase/migrations/004_add_energy_system.sql`)
- ✅ 에너지 유틸리티 함수 (`lib/supabase/utils.ts`): `consumeEnergy`, `produceEnergy`, `chargeEnergyDaily`, `getUsersNeedingEnergyCharge`
- ✅ 자정 충전 API (`app/api/energy/charge-daily/route.ts`)
- ✅ `/api/study/submit`에 에너지 소비/생산 로직 통합
- ✅ 에너지 게이지 UI 컴포넌트 (`components/EnergyGauge.tsx`)
- ✅ 에너지 부족 카운트다운 컴포넌트 (`components/EnergyCountdown.tsx`)
- ✅ 홈 화면에 에너지 게이지 통합
- ✅ 테스트 코드 작성 및 통과 (`lib/supabase/utils.test.ts` - 6개 테스트 통과)

**미구현:**
- ❌ Vercel Cron Job 설정 (`vercel.json`에 자정 자동 충전 스케줄 추가 필요)
  - 매일 자정(UTC)에 `/api/energy/charge-daily` 자동 호출
  - `vercel.json`에 `crons` 설정 추가 필요

---

#### 2. 기본 미션 흐름 완성 (✅ 구현 완료)
**설계 요구사항:**
- 순서: 미션 제시 → **어휘 노출** → **예시** → 작성 → LLM 피드백 → 보상

**현재 상태:**
- ✅ 미션 제시 (한글 문장 생성)
- ✅ **어휘 노출 UI 구현 완료** (미션 생성 시 어휘 목록 표시)
- ✅ **예시 문장 표시 UI 구현 완료**
- ✅ 작성 (영어 입력)
- ✅ LLM 피드백
- ❌ **보상 시스템 없음** (에너지 생산 등 - 별도 작업 필요)

**구현 완료:**
- ✅ `/api/study/generate-mission`에서 어휘 목록과 예시 문장 생성
- ✅ Writing 페이지에 어휘 노출 UI 추가 (노란색 배지 형태)
- ✅ Writing 페이지에 예시 문장 표시 UI 추가 (보라색 박스 형태)
- ✅ Mission 타입에 vocabulary, example 필드 추가
- ✅ 테스트 코드 작성 및 통과 (4개 테스트)

---

#### 3. "다시 써볼래?" 기능 (완전 미구현)
**설계 요구사항:**
- 피드백 후 버튼 노출 (`retry_count ≤ 3`)
- 3회 초과 시 다음 날 알림 예약 (FCM)

**현재 상태:**
- ❌ `study_logs.retry_count` 컬럼 없음
- ❌ Writing 페이지에 "다시 써볼래?" 버튼 없음
- ❌ 재시도 로직 없음
- ❌ 3회 초과 시 FCM 알림 예약 없음

**필요 작업:**
- [ ] `study_logs` 테이블에 `retry_count` 컬럼 추가 (마이그레이션)
- [ ] Writing 페이지 피드백 표시 후 "다시 써볼래?" 버튼 추가
- [ ] 재시도 로직 구현 (같은 미션으로 재제출, retry_count 증가)
- [ ] 3회 초과 시 FCM 알림 예약 (FCM 연동 후)

---

#### 4. Free 버전 제한 로직 수정
**설계 요구사항:**
- 에너지: 하루 1회 충전 (100)
- 피드백: **세션당 3회** (현재는 일일 5회)
- 힌트: 1회

**현재 상태:**
- ⚠️ 피드백 제한이 일일 5회로 설정됨 (`/api/study/submit` line 71)
- ❌ 세션당 제한 로직 없음 (일일 제한만 있음)
- ❌ 힌트 시스템 없음

**필요 작업:**
- [ ] 피드백 제한을 5회 → 3회로 변경
- [ ] 세션당 제한 로직 추가 (일일 제한과 별도)
- [ ] 힌트 시스템 구현 (1회 제한)

---

### 🟡 Phase 2: 게이미피케이션 및 UX

#### 5. Word Planet 탐험대 캐릭터 (완전 미구현)
**설계 요구사항:**
- 기본 1종 (탐험가 모자 쓴 작은 행성)
- 성장: 미션 완료 시 모자에 별 추가 (시각적 변화 3단계)

**현재 상태:**
- ❌ 캐릭터 컴포넌트 없음
- ❌ 캐릭터 성장 로직 없음
- ❌ 홈 화면에 캐릭터 표시 없음

**필요 작업:**
- [ ] 캐릭터 컴포넌트 디자인 및 구현
- [ ] 캐릭터 성장 로직 (미션 완료 시 별 추가)
- [ ] 3단계 시각적 변화 애니메이션
- [ ] 홈 화면에 캐릭터 표시

---

#### 6. 에너지 게이지 UI (완전 미구현)
**설계 요구사항:**
- 홈 화면 에너지 게이지
- 키즈 앱 스타일 (반짝이 + 별 요소 포함)
- 에너지 부족 시 카운트다운 표시

**현재 상태:**
- ❌ 에너지 게이지 컴포넌트 없음
- ❌ 홈 화면에 게이지 없음

**필요 작업:**
- [ ] 에너지 게이지 컴포넌트 생성
- [ ] 홈 화면(`app/page.tsx`)에 게이지 추가
- [ ] 카운트다운 UI (다음 충전까지 남은 시간)

---

### 🟢 Phase 3: 확장 기능

#### 7. 기본 학부모 리포트 (완전 미구현)
**설계 요구사항:**
- 접근: 별도 PIN 모드
- 내용: 주간 문장 수 / 자주 쓰는 단어 TOP5 / 간단 메시지
- Realtime: 미션 완료 시 부모 기기로 FCM 알림

**현재 상태:**
- ❌ `/api/parents/report` API 없음
- ❌ `/api/parents/push-token` API 없음
- ❌ 학부모 리포트 페이지(`/parents`) 없음
- ❌ PIN 모드 없음

**필요 작업:**
- [ ] `app/api/parents/report/route.ts` 생성
- [ ] `app/api/parents/push-token/route.ts` 생성
- [ ] `app/parents/page.tsx` 생성 (PIN 모드)
- [ ] 주간 통계 쿼리 (문장 수, 자주 쓰는 단어 TOP5)
- [ ] FCM 연동 (미션 완료 시 알림)

---

#### 8. FCM (Firebase Cloud Messaging) 연동 (완전 미구현)
**설계 요구사항:**
- 부모 푸시 알림 전용
- 미션 완료 시 부모 기기로 알림
- 부적절한 내용 감지 시 부모 알림

**현재 상태:**
- ❌ Firebase 프로젝트 설정 없음
- ❌ FCM 토큰 등록 API 없음
- ❌ 미션 완료 시 알림 전송 로직 없음
- ❌ 부적절한 내용 감지 시 알림 전송 로직 없음 (TODO 주석만 있음)

**필요 작업:**
- [ ] Firebase 프로젝트 설정
- [ ] FCM 토큰 등록 API (`/api/parents/push-token`)
- [ ] 미션 완료 시 알림 전송 로직
- [ ] 부적절한 내용 감지 시 알림 전송 로직

---

#### 9. RevenueCat 연동 (완전 미구현)
**설계 요구사항:**
- IAP 영수증 검증 로직 자동화
- Premium 전환 시 `profiles.is_premium = true` 업데이트

**현재 상태:**
- ❌ RevenueCat SDK 설정 없음
- ❌ 결제 검증 API 없음
- ❌ Premium 전환 로직 없음
- ❌ 결제 UI 없음

**필요 작업:**
- [ ] RevenueCat SDK 설정
- [ ] 결제 검증 API 생성
- [ ] Premium 전환 로직 (`profiles.is_premium = true` 업데이트)
- [ ] 결제 UI 구현

---

#### 10. PWA 설정 완료 (부분 구현)
**설계 요구사항:**
- 홈 화면 추가
- 오프라인 지원 (캐시된 미션 프롬프트 활용 가능)

**현재 상태:**
- ✅ `next-pwa` 패키지 설치됨
- ❌ `next.config.js`에 `next-pwa` 설정 없음 (주석 처리된 예시만 있음)
- ❌ PWA 매니페스트 파일 없음
- ❌ 오프라인 캐싱 전략 없음
- ❌ 서비스 워커 등록 안됨

**필요 작업:**
- [ ] `next.config.js`에 `next-pwa` 설정 추가
- [ ] PWA 매니페스트 파일 생성 (`public/manifest.json`)
- [ ] 오프라인 캐싱 전략 설정 (미션 프롬프트 캐싱)
- [ ] 서비스 워커 등록

---

## 📊 데이터베이스 스키마 업데이트 필요

### `profiles` 테이블
```sql
-- energy 기본값 변경 (5 → 100)
ALTER TABLE profiles ALTER COLUMN energy SET DEFAULT 100;

-- energy_last_charged 컬럼 추가
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS energy_last_charged TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

### `study_logs` 테이블
```sql
-- energy_gained 컬럼 추가
ALTER TABLE study_logs
ADD COLUMN IF NOT EXISTS energy_gained INTEGER DEFAULT 0;

-- retry_count 컬럼 추가
ALTER TABLE study_logs
ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0;
```

---

## 🎯 우선순위별 구현 계획

### Week 1 (핵심 기능)
1. ✅ Placement Test 시스템 (완료)
2. 🔴 에너지 시스템 완성 (자동 충전/소비/UI)
3. 🔴 기본 미션 흐름 완성 (어휘/예시 노출)
4. 🔴 "다시 써볼래?" 기능

### Week 2 (게이미피케이션)
5. 🟡 Word Planet 캐릭터
6. 🟡 에너지 게이지 UI
7. 🔴 Free 버전 제한 로직 완성

### Week 3 (확장 기능)
8. 🟢 기본 학부모 리포트
9. 🟢 FCM 연동
10. 🟢 RevenueCat 연동
11. 🟢 PWA 설정 완료

---

## 📝 참고사항

- 현재 구현된 기능들은 기본적인 MVP 기능만 포함
- `03_design.md`의 모든 기능을 구현하려면 위의 미구현 항목들을 순차적으로 개발해야 함
- 데이터베이스 스키마 업데이트는 먼저 진행해야 함 (에너지 시스템, 재시도 기능에 필요)
- 테스트 코드 작성 필수 (`.cursorrules` 규칙)
