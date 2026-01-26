# Korean 필드 번역 가이드

## 개요

DB의 `missions` 테이블에서 `korean` 필드가 영어 문장인 경우, OpenAI API를 사용하여 한글로 번역하고 업데이트하는 스크립트입니다.

## 사전 준비

1. **환경 변수 확인**
   - `.env` 파일 또는 환경 변수에 다음이 설정되어 있어야 합니다:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `OPENAI_API_KEY`

2. **DB 상태 확인**
   - 먼저 `check-korean-field.sql` 파일의 쿼리를 실행하여 영어 문장이 있는 미션 수를 확인하세요.

## 실행 방법

```bash
npm run translate-korean
```

## 스크립트 동작 과정

1. **미션 조회**: `keyboard` 타입이고 `is_active = true`인 모든 미션 조회
2. **필터링**: `korean` 필드에 한글이 포함되지 않은 미션만 선택
3. **번역**: OpenAI API를 사용하여 각 영어 문장을 한글로 번역
4. **업데이트**: 번역된 한글 문장으로 DB 업데이트
5. **결과 출력**: 성공/실패 개수 출력

## 주의사항

- ⚠️ **API 비용**: OpenAI API 호출 비용이 발생할 수 있습니다
- ⚠️ **처리 시간**: 미션 수에 따라 처리 시간이 오래 걸릴 수 있습니다 (초당 약 2-3개)
- ⚠️ **API 제한**: OpenAI API의 rate limit을 고려하여 요청 간 딜레이(400ms)를 두었습니다
- ⚠️ **백업 권장**: 실행 전에 DB 백업을 권장합니다

## 예상 실행 시간

- 100개 미션: 약 1-2분
- 1000개 미션: 약 10-15분
- 10000개 미션: 약 1.5-2시간

## 문제 해결

### 환경 변수 오류
```
❌ Supabase 환경 변수가 설정되지 않았습니다.
```
→ `.env` 파일에 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`를 확인하세요.

### OpenAI API 오류
```
❌ OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.
```
→ `.env` 파일에 `OPENAI_API_KEY`를 확인하세요.

### 번역 실패
- 일부 미션이 번역에 실패할 수 있습니다
- 실패한 미션은 건너뛰고 계속 진행됩니다
- 실패한 미션은 나중에 다시 실행할 수 있습니다

## 결과 확인

스크립트 실행 후 `check-korean-field.sql`의 쿼리를 다시 실행하여:
- 영어 문장이 있는 미션 수가 0개인지 확인
- 모든 `korean` 필드가 한글로 변환되었는지 확인
