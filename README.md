# 영어 문장 쓰기 앱 (ESL Writing App)

초등학생을 위한 영어 문장 쓰기 학습 앱입니다. AI 기반 피드백과 Placement Test를 통해 맞춤형 학습 경험을 제공합니다.

## 🚀 주요 기능

- **게스트 모드**: 익명 계정으로 즉시 시작 가능
- **Placement Test**: GPT-4o 기반 실력 평가 및 학년 추천 (1-6학년)
  - Placement Test는 학생의 실제 영어 실력에 맞는 적절한 학년을 추천합니다
  - 예: 4학년 학생이지만 영어 실력이 부족하면 → 추천 학년: 1-2학년
  - 예: 1학년 학생이지만 영어 실력이 뛰어나면 → 추천 학년: 4-6학년
  - 기존 학년이 있으면 자동 스킵 (재시도 옵션 제공)
- **학년별 맞춤 학습**:
  - **저학년(1-3학년)**: Drag & Drop 미션 (클릭 기반 단어 선택)
    - 학년이 낮을수록 더 간단한 문장과 어휘 사용
  - **고학년(4-6학년)**: 키보드 입력 방식
    - 학년이 높을수록 더 복잡한 문장 구조와 다양한 표현 사용
  - **학년의 역할**:
    - 학년에 따라 문장의 난이도, 길이, 문법 요소가 자동으로 결정됨
    - 쉬우면 다음 학년으로 올라가는 것이 직관적이고 자연스러움
    - 예: 1학년 → 간단한 문장 (3-5단어), 기본 단어
    - 예: 4학년 → 일반적인 문장 (7-10단어), 형용사/부사 포함
    - 예: 6학년 → 복잡한 문장 (9-12단어), 접속사, 복합 문장
- **AI 피드백**: 영어 문장 작성 후 즉시 AI 평가 및 교정
  - 힌트 시스템: 정답/오답 모두 다음 문장 학습 힌트 제공
  - 정답 시 자동으로 다음 문장 생성 (2초 후)
- **3중 안전 필터링**: 클라이언트 금칙어 필터 → OpenAI Moderation → AI Persona 검증
- **에너지 시스템**: 학습 시 에너지 감소 (미션 생성 1 에너지 소모)
- **학습 기록**: 모든 작성 내용과 피드백을 데이터베이스에 저장

## 🛠 기술 스택

### Frontend
- **Next.js 16.1.1** (App Router)
- **React 19.2.3**
- **TypeScript 5.3.3**
- **Tailwind CSS 3.4.19**
- **next-pwa 5.6.0** (PWA 지원)

### Backend
- **Next.js API Routes** (Serverless Functions)
- **Supabase** (PostgreSQL + Authentication + Realtime)
- **OpenAI GPT-4o** (AI 피드백 및 Placement Test 평가)
- **Zod 4.3.5** (스키마 검증)

### Testing
- **Vitest 1.0.4** (단위 테스트)
- **Playwright 1.57.0** (E2E 테스트)
- **Testing Library** (React 컴포넌트 테스트)

### Infrastructure
- **Vercel** (배포 및 호스팅)
- **Supabase** (Database, Auth, Storage)

### 기타
- **react-hot-toast** (알림)
- **date-fns** (날짜 처리)
- **recharts** (차트/통계)

## 📁 프로젝트 구조

```
english-write-study-app/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   └── guest/            # 게스트 인증
│   │   ├── placement/
│   │   │   ├── questions/        # Placement Test 문항 생성
│   │   │   └── submit/           # Placement Test 결과 평가
│   │   └── study/
│   │       ├── generate-mission/         # 한글 문장 생성 (레벨 3-6)
│   │       ├── generate-drag-drop-mission/  # Drag & Drop 미션 생성 (레벨 1-2)
│   │       ├── submit/                  # 영어 문장 제출 및 피드백
│   │       └── drag-drop-submit/        # Drag & Drop 미션 제출
│   ├── onboarding/               # 온보딩 페이지 (학년 선택)
│   ├── placement/                # Placement Test 페이지
│   ├── writing/                  # 영어 문장 쓰기 페이지
│   ├── layout.tsx                # 루트 레이아웃
│   ├── page.tsx                  # 홈 페이지
│   └── globals.css               # 전역 스타일
├── lib/                          # 라이브러리 및 유틸리티
│   ├── supabase/
│   │   ├── client.ts             # 클라이언트 Supabase 클라이언트
│   │   ├── server.ts              # 서버 Supabase 클라이언트
│   │   ├── middleware.ts         # 미들웨어 Supabase 클라이언트
│   │   └── utils.ts              # Supabase 유틸리티 함수
│   ├── openai/
│   │   ├── client.ts             # OpenAI 클라이언트 초기화
│   │   └── moderation.ts         # OpenAI Moderation API
│   └── safety/
│       └── profanity-filter.ts   # 클라이언트 금칙어 필터
├── types/                        # TypeScript 타입 정의
│   ├── database.ts               # Supabase 데이터베이스 타입
│   ├── user.ts                   # 사용자 관련 타입
│   ├── writing.ts                # 작성 관련 타입
│   ├── feedback.ts               # 피드백 관련 타입
│   ├── gamification.ts           # 게이미피케이션 타입
│   └── payment.ts                # 결제 관련 타입
├── supabase/
│   └── migrations/               # 데이터베이스 마이그레이션
│       ├── 001_initial_schema.sql
│       ├── 002_rls_policies.sql
│       └── 003_add_placement_level.sql
├── components/                   # 공통 컴포넌트
│   ├── DragDropMission.tsx      # Drag & Drop 미션 컴포넌트
│   ├── Header.tsx               # 헤더 컴포넌트
│   └── ...
├── services/                     # 서비스 레이어 (레거시)
├── e2e/                          # E2E 테스트
├── scripts/                      # 유틸리티 스크립트
│   ├── jira-logger.js            # Jira 자동 로깅
│   └── log-work-summary.mjs      # 작업 요약 로깅
├── docs/                         # 문서
│   ├── spec.md                   # 기획서
│   ├── 02_schema.sql             # 데이터베이스 스키마
│   └── 03_design.md              # 시스템 설계서
├── next.config.js                # Next.js 설정
├── tsconfig.json                 # TypeScript 설정
├── tailwind.config.js            # Tailwind CSS 설정
└── package.json                  # 의존성 관리
```

## 🗄 데이터베이스 스키마

### 주요 테이블

- **profiles**: 사용자 프로필 및 재화 (에너지, 젬, 레벨 등)
- **study_logs**: 학습 기록 (미션, 사용자 입력, AI 피드백)
- **shop_items**: 상점 아이템
- **user_inventory**: 사용자 인벤토리

### 보안

- **Row Level Security (RLS)**: 모든 테이블에 RLS 정책 적용
- **익명 인증**: 게스트 모드 지원

## 🚦 시작하기

### 필수 요구사항

- Node.js 18+ 
- npm 또는 yarn
- Supabase 계정
- OpenAI API 키

### 설치

```bash
# 저장소 클론
git clone https://github.com/iamyooon/english-write-study-app.git
cd english-write-study-app

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env.local
# .env.local 파일을 편집하여 필요한 환경 변수 설정
```

### 환경 변수 설정

`.env.local` 파일에 다음 환경 변수를 설정하세요:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

자세한 설정 방법은 [ENV_SETUP_GUIDE.md](./ENV_SETUP_GUIDE.md)를 참고하세요.

### 개발 서버 실행

```bash
npm run dev
```

개발 서버가 http://localhost:3000 에서 실행됩니다.

### 빌드

```bash
npm run build
npm start
```

## 🧪 테스트

### 단위 테스트

```bash
# 모든 테스트 실행
npm test

# Watch 모드
npm run test:watch

# 커버리지 포함
npm run test:coverage
```

### E2E 테스트

```bash
# E2E 테스트 실행
npm run test:e2e

# UI 모드로 실행
npm run test:e2e:ui
```

### 커밋 전 자동 검사

```bash
# 타입 체크 + 린트 + 테스트 + 문서 업데이트
npm run pre-commit

# 문서만 업데이트
npm run update-docs
```

**참고**: 커밋 전에 `npm run pre-commit`을 실행하면 자동으로 테스트를 실행하고 문서를 업데이트합니다.

## 📚 주요 문서

- [시스템 설계서](./docs/03_design.md) - 전체 시스템 아키텍처 및 설계
- [데이터베이스 스키마](./docs/02_schema.sql) - 데이터베이스 스키마 정의
- [Supabase 설정 가이드](./SUPABASE_SETUP.md) - Supabase 프로젝트 설정
- [Placement Test 설정](./PLACEMENT_TEST_SETUP.md) - Placement Test 시스템 설정
- [구현 상태 체크리스트](./IMPLEMENTATION_STATUS.md) - 구현 완료/미완료 기능
- [보안 가이드](./SECURITY.md) - 보안 설정 및 API 키 관리

## 🔐 보안

- **Row Level Security (RLS)**: Supabase 테이블에 RLS 정책 적용
- **3중 안전 필터링**: 클라이언트 → OpenAI Moderation → AI Persona 검증
- **환경 변수**: 민감한 정보는 환경 변수로 관리
- **익명 인증**: 게스트 모드 지원

자세한 내용은 [SECURITY.md](./SECURITY.md)를 참고하세요.

## 🚢 배포

이 프로젝트는 [Vercel](https://vercel.com)에 배포되어 있습니다.

### Vercel 배포

1. Vercel 대시보드에서 프로젝트 연결
2. 환경 변수 설정
3. 자동 배포 활성화

자세한 배포 방법은 [DEPLOY_STEPS.md](./DEPLOY_STEPS.md)를 참고하세요.

## 📝 라이선스

ISC

## 👥 기여

이슈 및 Pull Request를 환영합니다!

## 📞 문의

프로젝트 관련 문의사항이 있으시면 이슈를 생성해주세요.

---

**참고**: 이 프로젝트는 초등학생을 대상으로 한 영어 학습 앱입니다. 모든 사용자 입력은 안전 필터링을 거칩니다.
