# Supabase 타입 생성 가이드

## 문제 상황

TypeScript 타입 에러가 발생하는 이유는 `types/database.ts` 파일이 최신 데이터베이스 스키마와 일치하지 않기 때문입니다.

## 근본적 해결 방법

### 1. Supabase CLI로 최신 타입 재생성

```bash
# Supabase CLI 설치 (아직 설치하지 않은 경우)
npm install -g supabase

# Supabase에 로그인
npx supabase login

# 최신 타입 생성
npx supabase gen types typescript --project-id ilgwjhtjdaghgwapwcki > types/database.ts
```

### 2. 프로젝트 ID 확인

프로젝트 ID는 Supabase 대시보드에서 확인할 수 있습니다:
1. https://supabase.com/dashboard 접속
2. 프로젝트 선택
3. Settings → General → Reference ID 확인

### 3. 타입 생성 후 확인 사항

생성된 `types/database.ts` 파일에서 다음을 확인:

- ✅ `profiles` 테이블에 `name` 필드가 있는지
- ✅ `profiles` 테이블에 `energy_last_charged` 필드가 있는지
- ✅ `study_logs` 테이블에 `energy_gained` 필드가 있는지
- ✅ 모든 필드의 타입이 올바른지

### 4. 타입 생성 자동화 (권장)

`package.json`에 스크립트 추가:

```json
{
  "scripts": {
    "types:generate": "npx supabase gen types typescript --project-id ilgwjhtjdaghgwapwcki > types/database.ts",
    "types:check": "tsc --noEmit"
  }
}
```

### 5. 스키마 변경 시마다 타입 재생성

데이터베이스 스키마를 변경할 때마다:
1. 마이그레이션 적용
2. `npm run types:generate` 실행
3. `npm run types:check`로 타입 에러 확인
4. 필요시 코드 수정

## 현재 문제 해결

현재 발생한 타입 에러들을 해결하려면:

1. **즉시 해결**: `as any` 타입 단언 사용 (임시)
2. **근본적 해결**: 위의 방법으로 타입 재생성

## 타입 재생성 후 기대 효과

- ✅ 모든 Supabase 쿼리에 정확한 타입 추론
- ✅ `.update()`, `.insert()`, `.select()` 등에서 자동완성 지원
- ✅ 타입 에러를 컴파일 타임에 발견 가능
- ✅ `as any` 타입 단언 불필요

## 참고 자료

- [Supabase TypeScript 타입 생성 문서](https://supabase.com/docs/reference/cli/supabase-gen-types-typescript)
- [Supabase CLI 설치 가이드](https://supabase.com/docs/reference/cli/introduction)
