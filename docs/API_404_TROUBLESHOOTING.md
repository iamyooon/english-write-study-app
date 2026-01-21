# API 404 에러 해결 가이드

## 문제: `/api/energy/charge-daily` 엔드포인트에서 404 에러 발생

### 확인 사항

#### 1. 파일 구조 확인
✅ 파일이 올바른 위치에 있습니다:
- `app/api/energy/charge-daily/route.ts` ✅ 존재함

#### 2. Next.js App Router 구조 확인
✅ 구조가 올바릅니다:
- `export async function GET(request: Request)` ✅
- `export async function POST(request: Request)` ✅

#### 3. 가능한 원인

**원인 1: 배포가 안 되었거나 실패함**
- Vercel에 최신 코드가 배포되지 않았을 수 있습니다
- 해결: GitHub에 푸시하고 Production 배포 확인

**원인 2: Vercel이 프로젝트를 Next.js로 인식하지 못함**
- `vercel.json`에 잘못된 설정이 있을 수 있습니다
- 해결: `vercel.json`을 최소한으로 유지 (crons만 포함)

**원인 3: 빌드 과정에서 API 라우트가 제외됨**
- 빌드 로그에서 API 라우트가 포함되었는지 확인 필요

## 해결 방법

### 방법 1: 로컬에서 테스트

로컬 개발 서버에서 먼저 테스트:

```bash
npm run dev
```

브라우저에서:
```
http://localhost:3000/api/energy/charge-daily
```

로컬에서도 404가 발생하면 코드 문제, 정상 동작하면 배포 문제입니다.

### 방법 2: Vercel 배포 확인

1. **GitHub에 푸시 확인**
   ```bash
   git status
   git add vercel.json
   git commit -m "fix: Vercel Cron Job 설정"
   git push origin main
   ```

2. **Vercel 대시보드에서 배포 확인**
   - Deployments 탭에서 최신 배포 상태 확인
   - 빌드 로그에서 에러 확인
   - 배포가 성공했는지 확인

3. **Functions 탭에서 확인**
   - Functions 탭에서 `/api/energy/charge-daily` 함수가 있는지 확인
   - 없다면 빌드 과정에서 제외된 것입니다

### 방법 3: vercel.json 최소화

현재 `vercel.json`은 올바르게 설정되어 있습니다:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "crons": [
    {
      "path": "/api/energy/charge-daily",
      "schedule": "0 0 * * *"
    }
  ]
}
```

**주의**: `framework`, `buildCommand` 등의 설정은 제거해야 합니다. Next.js는 자동 감지됩니다.

### 방법 4: Vercel 프로젝트 설정 확인

Vercel 대시보드에서:

1. 프로젝트 선택 → **Settings** → **General**
2. **Framework Preset**이 **Next.js**로 설정되어 있는지 확인
3. **Root Directory**가 올바른지 확인 (보통 `./`)
4. **Build Command**가 `next build`인지 확인
5. **Output Directory**가 `.next`인지 확인

### 방법 5: 수동 재배포

```bash
# Vercel CLI 사용
vercel --prod

# 또는 GitHub에서 수동 트리거
git commit --allow-empty -m "trigger redeploy"
git push origin main
```

## 디버깅 단계

### 1단계: 로컬 테스트
```bash
npm run dev
# 브라우저에서 http://localhost:3000/api/energy/charge-daily 접속
```

### 2단계: 빌드 테스트
```bash
npm run build
# 빌드가 성공하는지 확인
# .next/server/app/api/energy/charge-daily/route.js 파일이 생성되는지 확인
```

### 3단계: 배포 확인
- Vercel 대시보드 → Deployments → 최신 배포 클릭
- 빌드 로그 확인
- Functions 탭에서 API 라우트 확인

### 4단계: 직접 호출 테스트
- Vercel Functions 탭에서 `/api/energy/charge-daily` 찾기
- "Invoke" 버튼으로 수동 실행
- 로그 확인

## 예상되는 해결책

가장 가능성 높은 원인: **배포가 안 되었거나 실패함**

해결 순서:
1. ✅ `vercel.json` 확인 (이미 올바름)
2. ⏳ GitHub에 푸시
3. ⏳ Vercel Production 배포 확인
4. ⏳ Functions 탭에서 API 라우트 확인

## 추가 확인 사항

### 다른 API 라우트는 동작하는가?

다른 API 엔드포인트를 테스트해보세요:
- `/api/study/submit`
- `/api/study/generate-mission`
- `/api/placement/submit`

이들도 404가 발생하면 전체 배포 문제입니다.
이들만 정상 동작하면 `/api/energy/charge-daily`만의 문제입니다.
