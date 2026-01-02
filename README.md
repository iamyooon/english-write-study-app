# 영어 일기 쓰기 앱 (English Write Study App)

영어 일기를 작성하고 AI로 문법 교정을 받을 수 있는 웹 애플리케이션입니다.

## 배포

이 프로젝트는 Vercel에 배포되어 있습니다.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/english-write-study-app)

## 개발 서버 실행

```bash
npm run dev
```

개발 서버가 http://localhost:5173 에서 실행됩니다.

## 테스트 실행

### 단위 테스트 (Vitest)

```bash
# 모든 테스트 실행
npm test

# Watch 모드로 실행
npm run test:watch

# 커버리지 포함 실행
npm run test:coverage
```

### E2E 테스트 (Playwright)

```bash
# E2E 테스트 실행
npm run test:e2e

# UI 모드로 실행 (테스트를 시각적으로 확인)
npm run test:e2e:ui
```

## 프로젝트 구조

```
├── components/          # React 컴포넌트
│   ├── DiaryPage.tsx   # 메인 다이어리 페이지
│   └── DiaryPage.test.tsx  # 단위 테스트
├── services/           # 서비스 레이어
│   └── GrammarService.ts  # 문법 교정 서비스
├── utils/              # 유틸리티 함수
│   └── diffUtils.ts    # Diff 계산 유틸리티
├── e2e/                # E2E 테스트
│   └── diary.spec.ts   # Playwright E2E 테스트
└── src/                # 앱 진입점
    ├── main.tsx        # React 앱 진입점
    └── index.css       # 전역 스타일
```

## 주요 기능

- 영어 일기 작성
- AI 문법 교정
- Diff 형식으로 수정된 부분 강조 표시

## 기술 스택

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Vitest (단위 테스트)
- Playwright (E2E 테스트)

