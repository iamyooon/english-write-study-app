# Vercel Cron Job 문제 해결 가이드

## 문제: Cron Job이 대시보드에 나타나지 않음

### 확인 사항 체크리스트

#### 1. Production 배포 확인
**중요**: Vercel Cron Jobs는 **Production 배포에서만** 동작합니다.

- [ ] Vercel 대시보드 → Deployments 탭 확인
- [ ] 최신 배포가 **Production**인지 확인 (Preview가 아닌지)
- [ ] Production 배포가 없다면:
  ```bash
  git push origin main
  # 또는
  vercel --prod
  ```

#### 2. vercel.json 파일 확인
- [ ] 프로젝트 루트에 `vercel.json` 파일이 있는지 확인
- [ ] 파일 내용에 `crons` 배열이 있는지 확인
- [ ] JSON 문법 오류가 없는지 확인

#### 3. API 경로 확인
- [ ] `/api/energy/charge-daily` 경로가 실제로 존재하는지 확인
- [ ] `app/api/energy/charge-daily/route.ts` 파일이 있는지 확인
- [ ] GET 또는 POST 메서드가 구현되어 있는지 확인

#### 4. Vercel 대시보드에서 확인 위치

**올바른 확인 위치:**
1. **Settings → Cron Jobs** (가장 확실한 위치)
   - 프로젝트 선택 → Settings 탭 → 왼쪽 메뉴에서 "Cron Jobs" 클릭
   - 여기에 등록된 Cron Job 목록이 표시됩니다

2. **Functions 탭** (간접 확인)
   - 프로젝트 선택 → Functions 탭
   - `/api/energy/charge-daily` 함수가 있는지 확인
   - Cron Job이 등록되어 있으면 함수 옆에 Cron 아이콘이 표시됩니다

3. **Deployments 탭** (배포 확인)
   - 최신 배포가 Production인지 확인
   - 배포 로그에서 `vercel.json`이 제대로 읽혔는지 확인

## 해결 방법

### 방법 1: vercel.json에 $schema 추가

`vercel.json` 파일을 다음과 같이 수정:

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

### 방법 2: Production 재배포

1. 변경사항 커밋 및 푸시:
   ```bash
   git add vercel.json
   git commit -m "fix: Vercel Cron Job 설정 수정"
   git push origin main
   ```

2. Vercel 자동 배포 대기 (또는 수동 배포):
   ```bash
   vercel --prod
   ```

3. 배포 완료 후 대시보드 확인:
   - Settings → Cron Jobs 탭에서 확인

### 방법 3: Vercel CLI로 확인

```bash
# Vercel CLI 설치 (없는 경우)
npm install -g vercel

# 프로젝트 정보 확인
vercel inspect

# 또는 프로젝트 연결 확인
vercel link
```

### 방법 4: 수동으로 Cron Job 등록 (임시 해결책)

만약 자동 등록이 안 된다면:

1. **Vercel 대시보드** → 프로젝트 선택
2. **Settings** → **Cron Jobs** 클릭
3. **Create Cron Job** 버튼 클릭
4. 다음 정보 입력:
   - **Path**: `/api/energy/charge-daily`
   - **Schedule**: `0 0 * * *`
   - **Timezone**: UTC

## Cron Job이 등록되지 않는 일반적인 원인

### 1. Preview 배포만 있음
- **해결**: Production 배포 필요
- **확인**: Deployments 탭에서 Production 배포 확인

### 2. vercel.json 파일이 루트에 없음
- **해결**: 프로젝트 루트에 `vercel.json` 파일 생성/확인

### 3. JSON 문법 오류
- **해결**: JSON 유효성 검사
- **도구**: https://jsonlint.com/

### 4. 경로가 존재하지 않음
- **해결**: `app/api/energy/charge-daily/route.ts` 파일 확인
- **테스트**: 브라우저에서 `https://your-project.vercel.app/api/energy/charge-daily` 접속

### 5. Hobby 플랜 제한
- **확인**: Vercel 플랜 확인
- **참고**: Hobby 플랜에서도 Cron Jobs 사용 가능 (제한 있음)

## 테스트 방법

### 1. API 엔드포인트 직접 호출 테스트

브라우저 또는 curl로 테스트:
```bash
curl https://your-project.vercel.app/api/energy/charge-daily
```

또는 브라우저에서:
```
https://your-project.vercel.app/api/energy/charge-daily
```

### 2. Vercel Functions에서 수동 실행

1. Vercel 대시보드 → 프로젝트 선택
2. **Functions** 탭 클릭
3. `/api/energy/charge-daily` 찾기
4. **Invoke** 버튼 클릭하여 수동 실행
5. 로그 확인

### 3. Cron Job 실행 로그 확인

1. Vercel 대시보드 → 프로젝트 선택
2. **Settings** → **Cron Jobs** 클릭
3. 등록된 Cron Job 클릭
4. 실행 로그 확인

## 다음 단계

1. ✅ `vercel.json`에 `$schema` 추가 완료
2. ⏳ 변경사항 커밋 및 푸시
3. ⏳ Production 배포 대기
4. ⏳ Vercel 대시보드에서 Cron Job 확인

## 참고 자료

- [Vercel Cron Jobs 공식 문서](https://vercel.com/docs/cron-jobs)
- [Vercel Cron Jobs 관리 가이드](https://vercel.com/docs/cron-jobs/manage-cron-jobs)
- [Cron 표현식 가이드](https://crontab.guru/)
