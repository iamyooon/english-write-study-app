# Generated Missions 적용 가이드

생성된 미션 데이터를 Supabase DB에 적재하는 방법입니다.

## 1) 적용 파일

- 기본 파일: `docs/migrations/seed_generated_missions_scored_rebalanced.sql`
- 분할 파일(권장): `docs/migrations/seed_generated_missions_scored_rebalanced_chunked.sql`
- 초소형 파일(최대 100개/파일): `docs/migrations/seed_generated_missions_scored_rebalanced_parts/seed_part_001.sql` 등

> 대용량 INSERT는 SQL Editor에서 실패할 수 있으므로 **chunked 버전 사용**을 권장합니다.
> 그래도 실패하면 **parts** 파일을 순서대로 실행하세요.

## 2) Supabase SQL Editor로 적용

1. Supabase 프로젝트 → **SQL Editor** 열기
2. `seed_generated_missions_scored_rebalanced_chunked.sql` 내용을 붙여넣기
3. 실행

### 실패 시 (parts 사용)

1. `docs/migrations/seed_generated_missions_scored_rebalanced_parts/` 폴더 열기
2. `seed_part_001.sql`부터 순서대로 붙여넣고 실행

## 2-1) 자동 업로드 (권장)

Supabase REST API로 자동 업로드할 수 있습니다.

1. `.env.local`에 아래 값 추가

```env
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

2. 업로드 실행

```bash
node scripts/load-missions-to-supabase.js --chunk=100
```

> RLS가 활성화되어 있어 **서비스 롤 키**가 필요합니다.  
> 재실행 시 중복 삽입될 수 있으니 주의하세요.

## 3) 주의사항

- 기존 데이터와 중복될 수 있습니다. 필요 시 `missions` 테이블을 비운 뒤 실행하세요.
- `mission_data.korean`은 현재 영어 문장으로 들어가 있습니다.  
  (추후 한국어 문장 세트로 교체 필요)

## 4) 데이터 확인

적용 후 확인 스크립트 실행:

```bash
node scripts/verify-missions.js
```

## 5) 데이터 초기화

기존 데이터를 모두 삭제하고 싶을 때:

```bash
node scripts/reset-missions.js
```

> 주의: `user_mission_progress` 테이블의 데이터도 함께 삭제됩니다.
