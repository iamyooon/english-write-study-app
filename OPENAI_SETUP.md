# OpenAI API 키 설정 가이드

## 문제 해결

문장 생성이 실패하는 경우, OpenAI API 키가 올바르게 설정되지 않았을 수 있습니다.

## OpenAI API 키 확인

1. **현재 설정 확인**
   - `.env.local` 파일을 열어서 `OPENAI_API_KEY` 확인
   - `sk-your-openai-api-key`로 되어 있다면 실제 키로 변경 필요

2. **OpenAI API 키 발급**
   - https://platform.openai.com/api-keys 접속
   - 로그인 후 "Create new secret key" 클릭
   - 키 복사 (한 번만 표시되므로 저장!)

3. **환경 변수 업데이트**
   - `.env.local` 파일 열기
   - `OPENAI_API_KEY=sk-your-openai-api-key` 부분을 실제 키로 변경
   - 예: `OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxx`

4. **개발 서버 재시작**
   - 개발 서버 중지 (Ctrl+C)
   - `npm run dev` 다시 실행

## 확인 방법

개발 서버 콘솔에서 다음 메시지가 나타나면 키가 설정되지 않은 것입니다:

```
⚠️ OPENAI_API_KEY가 설정되지 않았거나 기본값입니다.
   .env.local 파일에 실제 OpenAI API 키를 입력해주세요.
```

## 주의사항

- API 키는 절대 Git에 커밋하지 마세요
- `.env.local` 파일은 `.gitignore`에 포함되어 있습니다
- API 키가 노출되면 즉시 재발급하세요

## 비용 관리

- OpenAI API는 사용량에 따라 비용이 발생합니다
- GPT-4o 모델 사용 시 비용이 높을 수 있습니다
- 필요시 GPT-3.5-turbo로 변경 가능합니다
