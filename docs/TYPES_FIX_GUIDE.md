# TypeScript 타입 에러 근본 해결 가이드

## 문제 원인 분석

### 1. 근본 원인
- `types/database.ts` 파일이 최신 데이터베이스 스키마와 일치하지 않음
- Supabase 클라이언트가 `Database` 타입을 제네릭으로 받지만, 타입 추론이 `never`로 떨어짐
- `as any` 타입 단언을 사용하여 타입 체크를 우회하고 있음

### 2. 왜 로컬 테스트에서 발견되지 않았나?
- `npm test`만 실행하고 `npm run type-check`를 실행하지 않음
- `npm run build`를 로컬에서 실행하지 않아서 빌드 타입 에러를 발견하지 못함
- Vercel 빌드 환경에서만 TypeScript 타입 체크가 실행됨

## 근본적 해결 방법

### 방법 1: Supabase CLI로 최신 타입 재생성 (권장)

```bash
# 1. Supabase CLI 설치 (아직 설치하지 않은 경우)
npm install -g supabase

# 2. Supabase에 로그인
npx supabase login

# 3. 최신 타입 생성
npm run types:generate
# 또는 직접 실행:
# npx supabase gen types typescript --project-id ilgwjhtjdaghgwapwcki > types/database.ts

# 4. 타입 체크 실행
npm run type-check
```

### 방법 2: 수동으로 타입 정의 업데이트 (임시)

이미 `types/database.ts`에 누락된 필드를 추가했습니다:
- ✅ `profiles.name: Text`
- ✅ `profiles.energy_last_charged: string | null`
- ✅ `study_logs.energy_gained: number | null`

하지만 **Supabase CLI로 재생성하는 것이 가장 정확합니다**.

## 완전한 해결을 위한 단계

### 1. 타입 재생성
```bash
npm run types:generate
```

### 2. 모든 `as any` 제거
타입이 올바르게 정의되면 `as any` 타입 단언을 제거할 수 있습니다:

```typescript
// ❌ 이전 (타입 단언 사용)
const updateSupabase = supabase as any
await updateSupabase.from('profiles').update({ energy: 100 })

// ✅ 이후 (올바른 타입 사용)
await supabase.from('profiles').update({ energy: 100 })
```

### 3. 타입 체크 통과 확인
```bash
npm run type-check
```

### 4. 빌드 테스트
```bash
npm run build
```

## 예방 조치

### 1. 커밋 전 필수 검증 추가
`.cursorrules`에 이미 추가했습니다:
- 타입 체크: `npm run type-check`
- 빌드 테스트: `npm run build`
- 단위 테스트: `npm test`

### 2. CI/CD 파이프라인에 타입 체크 추가
GitHub Actions나 Vercel에서 자동으로 타입 체크 실행

### 3. 스키마 변경 시마다 타입 재생성
데이터베이스 스키마를 변경할 때마다:
1. 마이그레이션 적용
2. `npm run types:generate` 실행
3. `npm run type-check`로 확인
4. 필요시 코드 수정

## 현재 상태

✅ **완료된 작업**:
- `types/database.ts`에 누락된 필드 추가 (`name`, `energy_last_charged`, `energy_gained`)
- `package.json`에 `types:generate` 스크립트 추가
- `.cursorrules`에 빌드/타입 체크 규칙 추가

⚠️ **남은 작업**:
- Supabase CLI로 최신 타입 재생성 (권장)
- 모든 `as any` 타입 단언 제거
- 타입 체크 통과 확인

## 참고 자료

- [Supabase TypeScript 타입 생성 문서](https://supabase.com/docs/reference/cli/supabase-gen-types-typescript)
- [Supabase CLI 설치 가이드](https://supabase.com/docs/reference/cli/introduction)
- [TypeScript 타입 시스템 이해하기](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html)
