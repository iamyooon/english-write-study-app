# Placement Test 설정 가이드

## 구현 완료 사항

✅ Placement Test 시스템이 게스트 모드에 자연스럽게 통합되었습니다.

### 구현된 기능

1. **데이터베이스 스키마**
   - `profiles` 테이블에 `placement_level` 컬럼 추가 (마이그레이션 파일 생성됨)

2. **API 엔드포인트**
   - `GET /api/placement/questions` - Placement Test 문항 생성
   - `POST /api/placement/submit` - Placement Test 결과 평가 및 저장

3. **UI 페이지**
   - `app/placement/page.tsx` - Placement Test 진행 페이지
   - 진행바, 격려 문구, 문항별 답변 입력

4. **온보딩 플로우**
   - 온보딩 완료 후 자동으로 Placement Test 페이지로 이동

5. **레벨 추천**
   - Writing 페이지에서 Placement Test 결과 기반 레벨 추천 표시
   - 레벨 선택 드롭다운에 추천 레벨 표시

## 설정 단계

### 1. 데이터베이스 마이그레이션 실행

Supabase 대시보드에서 다음 SQL을 실행하세요:

```sql
-- Placement Test 결과를 저장하기 위한 컬럼 추가
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS placement_level INTEGER DEFAULT 1;

-- placement_level은 1-10 범위 (1: 초급, 10: 고급)
COMMENT ON COLUMN profiles.placement_level IS 'Placement Test 결과 레벨 (1-10)';
```

또는 `supabase/migrations/003_add_placement_level.sql` 파일의 내용을 Supabase SQL Editor에 복사하여 실행하세요.

### 2. 타입 정의 업데이트 확인

`types/database.ts` 파일이 자동으로 업데이트되었습니다. `placement_level` 필드가 포함되어 있는지 확인하세요.

### 3. 테스트 플로우

1. **온보딩 페이지** (`/onboarding`)
   - 저학년/고학년 선택
   - "시작하기" 버튼 클릭

2. **Placement Test 페이지** (`/placement`)
   - 6개의 문항이 자동으로 생성됨
   - 각 문항에 한글 문장을 영어로 번역
   - 진행바와 격려 문구 표시
   - 모든 문항 완료 후 자동 제출

3. **Writing 페이지** (`/writing`)
   - Placement Test 결과 기반 레벨 추천 배너 표시
   - 레벨 선택 드롭다운에 추천 레벨 표시
   - 추천 레벨로 자동 설정됨

## 플로우 다이어그램

```
온보딩 (학년 선택)
    ↓
게스트 계정 생성
    ↓
Placement Test 페이지
    ↓
6개 문항 답변
    ↓
GPT-4o 평가
    ↓
placement_level 저장 (1-10)
    ↓
Writing 페이지 (레벨 추천 표시)
```

## Placement Test 평가 기준

GPT-4o가 다음 기준으로 평가합니다:

1. **정확도 (Accuracy)**: 문법, 철자, 어휘 사용의 정확성
2. **완성도 (Completeness)**: 문장의 완성도와 의미 전달
3. **시간 효율성 (Time Efficiency)**: 적절한 시간 내에 답변했는지

### 레벨 결정 기준

- **초등 저학년 기준**: 1-3 (초급), 4-6 (중급), 7-10 (고급)
- **초등 고학년 기준**: 1-4 (초급), 5-7 (중급), 8-10 (고급)

## API 사용 예시

### Placement Test 문항 생성

```typescript
const response = await fetch('/api/placement/questions?gradeLevel=elementary_low&count=6')
const { questions } = await response.json()
```

### Placement Test 제출

```typescript
const response = await fetch('/api/placement/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    answers: [
      {
        question: '나는 사과를 좋아해요.',
        userAnswer: 'I like apples.',
        timeSpent: 30
      },
      // ... 더 많은 답변
    ],
    gradeLevel: 'elementary_low'
  })
})

const { placement_level, evaluation } = await response.json()
```

## 주의사항

1. **OpenAI API 키**: Placement Test는 GPT-4o를 사용하므로 `OPENAI_API_KEY`가 설정되어 있어야 합니다.

2. **익명 인증**: 게스트 모드가 작동하려면 Supabase에서 익명 인증이 활성화되어 있어야 합니다.

3. **타입 정의**: `types/database.ts`가 업데이트되었지만, Supabase CLI로 타입을 재생성하면 덮어씌워질 수 있습니다. 수동으로 `placement_level` 필드를 추가해야 할 수 있습니다.

## 다음 단계

- [ ] 데이터베이스 마이그레이션 실행
- [ ] Placement Test 플로우 테스트
- [ ] 레벨 추천 기능 확인
- [ ] 필요시 문항 수 조정 (현재 6개)
