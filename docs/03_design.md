🏗️ ESL Writing App 시스템 설계서 (v2.1 - Production Ready \& MVP 기능 통합)  

\*\*버전\*\*: 2.1 (기존 v2.0 + MVP 핵심 기능 상세 설계 반영)  

\*\*목표\*\*: 1인/소규모 팀이 가장 빠르고 안전하게 런칭 가능한 아키텍처 수립  

\*\*작성일\*\*: 2026년 1월 15일  

\*\*참고\*\*: 기획서의 MVP 기능(Placement Test, 기본 미션 흐름, 에너지 시스템 등)을 시스템 아키텍처에 완전히 통합하여 구현 우선순위와 보안·성능 고려사항을 명확히 함.



\### 시스템 아키텍처 (Tech Stack)  

초기 비용 절감과 개발 속도를 위해 Serverless \& PWA로 시작하되, 결제와 알림은 전문 솔루션을 사용하여 리스크를 제거합니다.



\- \*\*Frontend (Web \& Mobile)\*\*: Next.js 14+ (App Router)  

&nbsp; - PWA: next-pwa 적용 (홈 화면 추가, 오프라인 지원 – 캐시된 미션 프롬프트 활용 가능)  

&nbsp; - Mobile Roadmap: MVP 검증 후 3개월 내 Capacitor를 통해 네이티브 앱(Android/iOS)으로 패키징  

\- \*\*Backend\*\*: Next.js API Routes (Serverless Functions)  

\- \*\*Database \& Auth\*\*: Supabase  

&nbsp; - DB: PostgreSQL (JSONB 활용)  

&nbsp; - Security: RLS(Row Level Security) 필수 적용  

&nbsp; - Realtime: 부모님 기기로 실시간 알림 전송 (예: 미션 완료 시)  

\- \*\*AI Engine\*\*: OpenAI API (GPT-4o)  

&nbsp; - Safety: OpenAI Moderation Endpoint 필수 경유  

\- \*\*Infrastructure\*\*: Vercel (Pro Plan 권장 - 상용화 시)  

\- \*\*Payments\*\*: RevenueCat (IAP 영수증 검증 로직 자동화)  

\- \*\*Notifications\*\*: FCM (Firebase Cloud Messaging) – 부모 푸시 알림 전용  



\### 데이터베이스 스키마 설계 (PostgreSQL + RLS)  

기존 스키마에 MVP 기능(에너지, Placement Test 결과, 미션 Queue 등)을 반영하여 확장했습니다.



A. \*\*profiles\*\* (사용자 정보 + 재화)  

&nbsp;  - 보안: 본인 데이터만 조회 가능 (RLS)  

&nbsp;  - 추가 컬럼:  

&nbsp;    - placement\_level int (Placement Test 결과 저장)  

&nbsp;    - energy int default 100 (매일 충전)  

&nbsp;    - energy\_last\_charged timestamp (충전 시점 추적)  



B. \*\*missions\*\* (커리큘럼 – 메타데이터 저장)  

&nbsp;  - jsonb로 프롬프트·어휘·예시 저장 (유연성 확보)  



C. \*\*study\_logs\*\* (학습 기록 \& Queue)  

&nbsp;  - 추가 컬럼:  

&nbsp;    - energy\_gained int (이번 미션에서 생산한 에너지)  

&nbsp;    - retry\_count int default 0 (다시 써볼래? 횟수 제한 3회)  

&nbsp;  - UGC 제한: is\_public default false (나만의 도서관)  



D. \*\*shop\_items \& user\_inventory\*\* (상점 \& 인벤토리) – 그대로 유지  



(기존 SQL 스크립트에 추가 업데이트 필요 – 아래 부록 참조)



\### 핵심 비즈니스 로직 및 안전장치 (MVP 기능 통합)



① \*\*Placement Test 기반 자동 레벨 배정\*\*  

&nbsp;  - 진입: 온보딩 후 즉시 실행 (Guest Mode 포함)  

&nbsp;  - 구현: /api/placement/submit 엔드포인트 → 5~7문항 처리 → GPT-4o로 점수 평가 (프롬프트: "초등 수준 정확도·완성도·시간 평가")  

&nbsp;  - 결과 저장: profiles.placement\_level 업데이트  

&nbsp;  - UI: 진행바 + 격려 문구 + 결과 애니메이션  



② \*\*기본 미션 흐름\*\* (MVP 핵심 루프)  

&nbsp;  - 순서: 미션 제시 → 어휘 노출 → 예시 → 작성 → LLM 피드백 → 보상  

&nbsp;  - 구현 포인트:  

&nbsp;    - 작성 입력 → 3중 안전 필터링 경유  

&nbsp;    - 피드백: Level 1에 한정 (긍정 중심 프롬프트)  

&nbsp;    - Free 제한: 피드백 3회 → 초과 시 queued 상태로 study\_logs 저장  

&nbsp;  - 엔드포인트: POST /api/study/submit (필터링 → AI → DB 저장 트랜잭션)  



③ \*\*Word Planet 탐험대 캐릭터 + 에너지 시스템\*\* (MVP 최소 구현)  

&nbsp;  - 캐릭터: 기본 1종 (탐험가 모자 쓴 작은 행성)  

&nbsp;    - 성장: 미션 완료 시 모자에 별 추가 (시각적 변화 3단계)  



아래는 추천 캐릭터 디자인 영감 (kawaii 스타일, 탐험가 모자 + 행성 형태, 귀여운 표정 중심)입니다.



&nbsp;  - 에너지 시스템:  

&nbsp;    - 매일 100 충전 (자정 기준)  

&nbsp;    - 미션 1회당 100 소비 (작성 문장당 +10 생산)  

&nbsp;    - 부족 시 카운트다운 UI  

&nbsp;    - 시각화: 홈 화면 에너지 게이지  



에너지 게이지 UI 영감 예시 (키즈 앱 스타일, 반짝이 + 별 요소 포함)입니다.









④ \*\*실패 없는 구조 (“다시 써볼래?” 유도)\*\*  

&nbsp;  - 피드백 후 버튼 노출 (retry\_count ≤ 3)  

&nbsp;  - 3회 초과 시 다음 날 알림 예약 (FCM)  



⑤ \*\*Free 버전 제한\*\*  

&nbsp;  - 에너지: 하루 1회 충전 (100)  

&nbsp;  - 피드백: 세션당 3회  

&nbsp;  - 힌트: 1회  

&nbsp;  - RevenueCat으로 Premium 전환 시 profiles.is\_premium = true 업데이트  



⑥ \*\*기본 학부모 리포트\*\*  

&nbsp;  - 접근: 별도 PIN 모드  

&nbsp;  - 내용: 주간 문장 수 / 자주 쓰는 단어 TOP5 / 간단 메시지  

&nbsp;  - Realtime: 미션 완료 시 부모 기기로 FCM 알림  



⑦ \*\*온보딩: Guest Mode + 학년 2택 선택 → 체험 미션\*\*  

&nbsp;  - 흐름: 스플래시 → Guest 버튼 → 학년 선택 → Level 1 체험  

&nbsp;  - 학년 선택 화면 영감 (큰 버튼 + 귀여운 일러스트)  



아래는 온보딩 화면 디자인 예시 (큰 선택 버튼, 친근한 캐릭터, 저학년/고학년 구분 명확)입니다.









\### API 설계 (주요 Endpoints – MVP 중심 확장)



\- \*\*POST /api/placement/submit\*\* : Placement Test 결과 처리  

\- \*\*POST /api/study/submit\*\* : 미션 제출 (필터링 → AI → Queue or Complete)  

\- \*\*GET /api/parents/report\*\* : 기본 리포트 조회  

\- \*\*POST /api/parents/push-token\*\* : FCM 토큰 등록  



\### 개발 로드맵 (Action Plan – 업데이트 버전)



\*\*Phase 1. 기반 및 보안 (Week 1)\*\*  

\- Supabase RLS + profiles 추가 컬럼 적용  

\- OpenAI Moderation + RevenueCat 샌드박스  

\- PWA 세팅  



\*\*Phase 2. 핵심 경험 (Week 2-3)\*\*  

\- 온보딩 플로우 (Guest → 학년 선택 → Placement Test → 체험 미션)  

\- 기본 미션 루프 + 에너지 시스템  

\- 캐릭터 기본 애니메이션  



\*\*Phase 3. 확장 및 런칭 (Week 4)\*\*  

\- Free 제한 로직 + 기본 학부모 리포트  

\- 내부 베타 (지인 10~20명)  



\### 🎁 \[부록] Supabase 최종 SQL 스크립트 업데이트 (즉시 실행용)  

기존 스크립트에 MVP 기능 반영된 버전입니다. (복사해서 Supabase SQL Editor에서 실행하세요)



```sql

-- 기존 profiles에 추가

ALTER TABLE profiles

ADD COLUMN placement\_level int DEFAULT 1,

ADD COLUMN energy\_last\_charged timestamp with time zone DEFAULT now();



-- study\_logs에 추가

ALTER TABLE study\_logs

ADD COLUMN energy\_gained int DEFAULT 0,

ADD COLUMN retry\_count int DEFAULT 0;



-- RLS 정책 재확인 (필수)

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- ... (기존 정책 유지)

