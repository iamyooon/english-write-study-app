# 테스트 실행 방법

## 필요한 패키지 설치

```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

또는

```yaml
# package.json에 추가할 devDependencies
{
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/user-event": "^14.0.0",
    "jsdom": "^23.0.0"
  }
}
```

## 테스트 실행

```bash
# 모든 테스트 실행
npm run test

# watch 모드로 실행
npm run test:watch

# 커버리지 포함 실행
npm run test:coverage
```

## 테스트 내용

`DiaryPage.test.tsx`는 다음을 테스트합니다:

1. **초기 렌더링**: 컴포넌트가 정상적으로 렌더링되는지 확인
2. **입력 기능**: textarea에 텍스트를 입력할 수 있는지 확인
3. **입력값 검증**: 
   - 입력값이 없을 때 경고 메시지 표시
   - 공백만 입력된 경우 경고 메시지 표시
4. **AI 교정 기능**: 
   - 유효한 텍스트로 GrammarService.check 호출
   - 로딩 상태 표시
   - 교정 결과 표시
   - 에러 처리
