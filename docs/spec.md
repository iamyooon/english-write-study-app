ESL Writing App - 최종 MVP 개발 핸드오버 문서
작성일: 2026년 1월 15일

대상: 개발 담당자
목적: 3개월 내 런칭을 위한 실행 지침 및 시스템 설계 통합본

1. 프로젝트 핵심 목표 (기획 요약)
타깃: 한국 초등 1~6학년 (저학년: 드래그&드롭 / 고학년: 자유 입력 & 사진)
컨셉: "아이 혼자 쓰고 AI가 코치해주는 영어 Writing 놀이터"
수익 모델: Freemium (무료: 제한적 피드백 + Queue / Premium: 무제한 + 교과서 맞춤 + 사진 코칭 / IAP: 에너지 리필 + 꾸미기)

핵심 차별점:
점진적 에볼루션: 단어(놀이)에서 에세이(학습)로 자연스러운 연결
안심 리포트: 교육부 필수 800단어 히트맵 + 성취도 분석
안전성: 3중 필터링과 폐쇄형 구조

2. 확정 기술 스택 (변경 금지)
Frontend/Backend: Next.js 14+ (App Router)
Mobile Strategy: PWA (next-pwa 필수) → (검증 후 3개월 뒤 Capacitor 네이티브 전환)
DB/Auth/Realtime: Supabase (PostgreSQL + RLS 필수 적용 + Auth + Realtime)
AI Engine: OpenAI GPT-4o (Text Generation + Vision + Moderation Endpoint)
In-App Purchase: RevenueCat (결제 검증 로직 외주화 필수)
Notifications: FCM (Firebase Cloud Messaging) + Supabase Realtime
Deployment: Vercel

3. MVP 필수 구현 범위 (우선순위 순)
인프라 구축: Supabase 프로젝트 생성, 테이블 설계(SQL 실행), RLS 보안 정책 적용.
온보딩 경험: 게스트 모드 진입 → [저학년/고학년] 선택 → Level 1 체험 미션(30초) 구현.
핵심 루프(Core Loop):
Writing 제출 (입력)
3중 필터링 (클라이언트 금칙어 → OpenAI Moderation → AI 페르소나)
AI 피드백 생성 및 DB 저장
Queue 시스템 (무료 유저 일일 제한 초과 시 "내일 확인" 처리)
리포트: 주간 문장 수 + 자주 쓰는 단어 + 800단어 히트맵 시각화.
게이미피케이션: 상점(스타 젬 구매/사용) + 캐릭터 꾸미기 + 인벤토리.

4. 절대 지켜야 할 규칙 (위반 시 재작업)
Security First: 모든 테이블에 RLS(Row Level Security) 적용 필수. (내 데이터는 나만 조회/수정 가능).
Safety Pipeline: OpenAI API 호출 전 반드시 Moderation API를 먼저 태워야 함. (욕설/유해 콘텐츠 원천 차단).
UGC Restriction: 타인의 글을 보는 갤러리는 초기 완전 비활성화 (나만의 도서관만 허용).
Payment Verification: 인앱 결제 검증 로직 직접 구현 금지 → RevenueCat SDK 사용.
Notification: DB 로그 적재뿐만 아니라 실제 부모 폰을 울리는 푸시(FCM) 연동 필수.

5. 주의 & 추후 보완 체크리스트
[ ] 데이터 콜드 스타트: 초기 500명 달성 전까지는 '또래 비교' 숨기고 **'절대평가 성취도'**만 노출.
[ ] Vision API 비용: Premium 유저라도 사진 코칭은 **'하루 5회'**로 시스템적 제한(Cap) 설정.
[ ] IAP 예외 처리: 에너지 리필(유료) 구매 시, 무료 유저라도 해당 세션은 Queue 없이 즉시 피드백 제공.
[ ] 성능 최적화: study_logs 테이블 user_id, created_at 복합 인덱스 생성 확인.
[ ] 법적 준수: 회원가입 시 '만 14세 미만' 처리 및 '부모 동의' UI/UX 철저 구현.

6. 첫 마일스톤 (Sprint 1 - 2주 목표)
Week 1: Supabase 세팅(RLS 포함) + Next.js PWA 환경 구성 + 욕설 필터링/Moderation 연동 테스트.
Week 2: 게스트 모드 온보딩 완료 (비로그인 상태에서 L1 단어 맞추기 실행 및 결과 확인).