# Vercel 재배포 가이드

## 방법 1: Vercel 웹 대시보드에서 재배포 (권장)

1. https://vercel.com/dashboard 방문
2. 프로젝트 `english-write-study-app` 선택
3. **Deployments** 탭으로 이동
4. 최신 배포 항목 옆의 **"..."** (점 3개) 메뉴 클릭
5. **"Redeploy"** 선택
6. 확인 대화상자에서 **"Redeploy"** 클릭

환경 변수가 이미 설정되어 있다면 재배포 시 자동으로 적용됩니다.

## 방법 2: GitHub 푸시로 자동 재배포

빈 커밋을 만들어 푸시하면 자동으로 재배포됩니다:

```powershell
git commit --allow-empty -m "trigger redeploy: apply OpenAI API key"
git push origin main
```

## 방법 3: Vercel CLI 사용

Vercel CLI에 로그인한 후:

```powershell
vercel login
vercel --prod
```

## 확인 사항

재배포 전에 확인:
- ✅ OpenAI API 키가 Vercel 환경 변수에 설정되어 있는지
- ✅ 환경 변수 이름이 `VITE_OPENAI_API_KEY`인지
- ✅ Production, Preview, Development 환경 모두 선택했는지

재배포 후:
- 배포 로그에서 빌드가 성공했는지 확인
- 배포된 사이트에서 문법 교정 기능이 정상 작동하는지 테스트

