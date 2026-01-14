# ESL Writing App - 프로젝트 구조 설계

## 폴더 구조 (Next.js 14+ App Router 기준)

```
english-write-study-app-main/
├── app/                          # Next.js App Router
│   ├── (auth)/                  # 인증 관련 라우트 그룹
│   │   ├── login/
│   │   ├── signup/
│   │   └── layout.tsx
│   ├── (guest)/                 # 게스트 모드 라우트 그룹
│   │   ├── onboarding/
│   │   └── layout.tsx
│   ├── (main)/                  # 메인 앱 라우트 그룹
│   │   ├── writing/             # Writing 제출 페이지
│   │   ├── library/             # 나만의 도서관
│   │   ├── report/              # 리포트 페이지
│   │   ├── shop/                # 상점 (스타 젬)
│   │   ├── character/           # 캐릭터 꾸미기
│   │   └── layout.tsx
│   ├── api/                     # API Routes
│   │   ├── auth/
│   │   ├── writing/
│   │   │   ├── submit/          # Writing 제출
│   │   │   ├── feedback/        # 피드백 조회
│   │   │   └── moderation/      # Moderation 체크
│   │   ├── queue/
│   │   ├── report/
│   │   └── payment/
│   ├── globals.css
│   ├── layout.tsx               # Root Layout
│   └── page.tsx                 # 홈 페이지
├── components/                   # React 컴포넌트
│   ├── ui/                      # 재사용 가능한 UI 컴포넌트
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── writing/                 # Writing 관련 컴포넌트
│   │   ├── WritingEditor.tsx
│   │   ├── DragDropEditor.tsx   # 저학년용 드래그&드롭
│   │   ├── FreeTextEditor.tsx   # 고학년용 자유 입력
│   │   └── PhotoUpload.tsx      # 사진 업로드
│   ├── feedback/                # 피드백 관련 컴포넌트
│   │   ├── FeedbackDisplay.tsx
│   │   └── FeedbackQueue.tsx
│   ├── onboarding/              # 온보딩 컴포넌트
│   │   ├── GradeSelection.tsx
│   │   └── Level1Trial.tsx
│   ├── report/                  # 리포트 컴포넌트
│   │   ├── WeeklyStats.tsx
│   │   ├── WordHeatmap.tsx      # 800단어 히트맵
│   │   └── AchievementChart.tsx
│   └── gamification/            # 게이미피케이션
│       ├── StarGemShop.tsx
│       ├── CharacterCustomizer.tsx
│       └── Inventory.tsx
├── lib/                         # 라이브러리 및 유틸리티
│   ├── supabase/                # Supabase 클라이언트
│   │   ├── client.ts            # 클라이언트 사이드
│   │   ├── server.ts             # 서버 사이드
│   │   └── middleware.ts         # 미들웨어용
│   ├── openai/                  # OpenAI 관련
│   │   ├── client.ts
│   │   ├── moderation.ts         # Moderation API
│   │   ├── feedback.ts          # 피드백 생성
│   │   └── vision.ts             # Vision API (사진 코칭)
│   ├── safety/                  # 안전성 관련
│   │   ├── profanity-filter.ts  # 클라이언트 금칙어 필터
│   │   └── moderation-pipeline.ts # 3중 필터링 파이프라인
│   ├── queue/                   # Queue 시스템
│   │   └── queue-manager.ts
│   ├── payment/                 # 결제 관련
│   │   └── revenuecat.ts        # RevenueCat SDK
│   └── notifications/           # 알림 관련
│       └── fcm.ts               # FCM 연동
├── types/                       # TypeScript 타입 정의
│   ├── database.ts              # Supabase Database 타입
│   ├── user.ts                  # 사용자 관련 타입
│   ├── writing.ts               # Writing 관련 타입
│   ├── feedback.ts              # 피드백 관련 타입
│   ├── gamification.ts          # 게이미피케이션 타입
│   └── payment.ts               # 결제 관련 타입
├── hooks/                       # Custom React Hooks
│   ├── useAuth.ts
│   ├── useWriting.ts
│   ├── useFeedback.ts
│   └── useQueue.ts
├── middleware.ts                # Next.js Middleware (RLS, Auth)
├── supabase/                    # Supabase 관련 파일
│   ├── migrations/              # SQL 마이그레이션 파일
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   └── 003_indexes.sql
│   └── seed.sql                 # 시드 데이터
├── public/                      # 정적 파일
│   ├── icons/                   # PWA 아이콘
│   └── manifest.json            # PWA 매니페스트
├── .env.local                   # 로컬 환경 변수
├── .env.example                 # 환경 변수 예제
├── next.config.js               # Next.js 설정
├── package.json
├── tsconfig.json                # TypeScript 설정
└── tailwind.config.js           # Tailwind CSS 설정
```

## 주요 디렉토리 설명

### app/
Next.js 14+ App Router 구조. 라우트 그룹을 사용하여 인증/게스트/메인 영역을 분리.

### lib/supabase/
Supabase 클라이언트 초기화 및 헬퍼 함수. 클라이언트/서버/미들웨어별로 분리.

### lib/openai/
OpenAI API 연동. Moderation, Feedback 생성, Vision API를 각각 모듈화.

### lib/safety/
3중 필터링 파이프라인: 클라이언트 금칙어 → OpenAI Moderation → AI 페르소나.

### types/
모든 TypeScript 타입 정의. Supabase에서 자동 생성된 타입도 포함.

### supabase/migrations/
데이터베이스 스키마 및 RLS 정책을 SQL 파일로 관리.
