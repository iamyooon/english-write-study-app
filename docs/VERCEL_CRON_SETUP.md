# Vercel Cron Job 설정 가이드

## 중요 사항

**Vercel Cron Job은 Vercel 플랫폼에서 실행됩니다. Supabase에 별도로 등록할 필요가 없습니다.**

## 1. vercel.json 설정 확인

`vercel.json` 파일에 Cron Job 설정이 포함되어 있습니다:

```json
{
  "crons": [
    {
      "path": "/api/energy/charge-daily",
      "schedule": "0 0 * * *"
    }
  ]
}
```

## 2. Vercel에 배포 후 Cron Job 자동 등록

### 배포 방법

1. **GitHub에 푸시** (이미 완료된 경우 생략)
   ```bash
   git add vercel.json
   git commit -m "feat: Vercel Cron Job 설정 추가"
   git push origin main
   ```

2. **Vercel 자동 배포**
   - GitHub 저장소가 Vercel에 연결되어 있으면 자동으로 배포됩니다
   - 또는 Vercel CLI 사용:
     ```bash
     vercel --prod
     ```

## 3. Vercel 대시보드에서 Cron Job 확인

배포가 완료된 후:

1. **Vercel 대시보드 접속**
   - https://vercel.com/dashboard 방문
   - 프로젝트 선택: `english-write-study-app`

2. **Cron Jobs 확인**
   - 왼쪽 메뉴에서 **Settings** 클릭
   - **Cron Jobs** 섹션 확인
   - 또는 **Functions** 탭에서 `/api/energy/charge-daily` 확인

3. **Cron Job 상태 확인**
   - Cron Job이 자동으로 등록되어 있어야 합니다
   - 다음 실행 시간이 표시됩니다
   - 실행 로그를 확인할 수 있습니다

## 4. Cron Job 수동 등록 (필요한 경우)

만약 자동으로 등록되지 않았다면:

1. **Vercel 대시보드** → 프로젝트 선택
2. **Settings** → **Cron Jobs** 클릭
3. **Create Cron Job** 버튼 클릭
4. 다음 정보 입력:
   - **Path**: `/api/energy/charge-daily`
   - **Schedule**: `0 0 * * *` (매일 자정 UTC)
   - **Timezone**: UTC (기본값)

## 5. Cron 스케줄 설명

- **`0 0 * * *`**: 매일 자정(00:00) UTC
- **한국 시간(KST)**: 매일 오전 9시 (UTC+9)

다른 시간으로 변경하려면:
- 한국 시간 자정: `0 15 * * *` (UTC 15:00 = KST 00:00)
- 한국 시간 오전 6시: `0 21 * * *` (UTC 21:00 = KST 06:00)

## 6. Cron Job 테스트

### 수동 실행 테스트

1. **Vercel 대시보드** → 프로젝트 선택
2. **Functions** 탭 클릭
3. `/api/energy/charge-daily` 찾기
4. **Invoke** 버튼 클릭하여 수동 실행

또는 브라우저에서 직접 호출:
```
https://your-project.vercel.app/api/energy/charge-daily
```

### 로그 확인

1. **Vercel 대시보드** → 프로젝트 선택
2. **Functions** 탭 → `/api/energy/charge-daily` 클릭
3. **Logs** 탭에서 실행 로그 확인

## 7. 문제 해결

### Cron Job이 등록되지 않는 경우

1. **vercel.json 파일 확인**
   - 파일이 프로젝트 루트에 있는지 확인
   - JSON 형식이 올바른지 확인

2. **재배포**
   ```bash
   git commit --allow-empty -m "trigger redeploy"
   git push origin main
   ```

3. **Vercel CLI로 확인**
   ```bash
   vercel inspect
   ```

### Cron Job이 실행되지 않는 경우

1. **API 엔드포인트 확인**
   - `/api/energy/charge-daily`가 정상 동작하는지 확인
   - 수동으로 호출하여 테스트

2. **환경 변수 확인**
   - `CRON_SECRET`이 설정되어 있다면 인증 헤더 확인
   - Vercel 대시보드 → Settings → Environment Variables

3. **로그 확인**
   - Functions 탭에서 에러 로그 확인
   - 실행 시간과 결과 확인

## 8. 참고 자료

- [Vercel Cron Jobs 공식 문서](https://vercel.com/docs/cron-jobs)
- [Cron 표현식 가이드](https://crontab.guru/)
