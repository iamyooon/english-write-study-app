# Vercel 환경 변수 설정 가이드

## OpenAI API 키를 Vercel에 설정하는 방법

1. Vercel 대시보드 접속: https://vercel.com/dashboard
2. 프로젝트 선택: `english-write-study-app`
3. **Settings** 탭 클릭
4. 왼쪽 메뉴에서 **Environment Variables** 클릭
5. 환경 변수 추가:
   - **Key**: `VITE_OPENAI_API_KEY`
   - **Value**: 본인의 OpenAI API 키
   - **Environment**: Production, Preview, Development 모두 선택 (또는 필요에 따라 선택)
6. **Save** 클릭
7. **Redeploy** 버튼을 클릭하여 환경 변수를 적용합니다

## OpenAI API 키 발급 방법

1. https://platform.openai.com/api-keys 방문
2. 계정 생성 또는 로그인
3. "Create new secret key" 클릭
4. 키 이름 입력 (예: "english-write-study-app")
5. 생성된 키 복사 (한 번만 표시되므로 안전하게 보관)

## 주의사항

- API 키는 절대 공개 저장소에 커밋하지 마세요
- Vercel의 환경 변수 설정을 사용하면 안전하게 API 키를 관리할 수 있습니다
- 환경 변수 변경 후에는 재배포가 필요합니다

