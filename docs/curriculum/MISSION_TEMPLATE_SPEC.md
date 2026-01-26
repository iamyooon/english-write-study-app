# 미션 템플릿 스펙 (Sentence-Based)

문장 세트(`word_sentence_sets_scored_rebalanced.json`)를 기반으로 생성되는 미션의 데이터 구조입니다.  
DB `missions.mission_type`는 기존 스키마에 맞춰 `drag_drop | keyboard`만 사용하며,  
세부 유형은 `mission_data.sub_type`으로 구분합니다.

## 공통 필드

- `korean`: 사용자에게 보여줄 한국어 프롬프트 (현재는 영어 문장으로 대체 가능)
- `word`: 해당 미션의 기준 단어
- `sentence`: 정답 영어 문장 (문장 세트에서 가져옴)
- `sentenceTokens`: 문장 토큰 배열
- `difficultyTier`: 문장 난이도 (1~3)
- `sub_type`: 세부 미션 유형

## drag_drop 유형

### 1) word_bank_fill (단어 끼우기)
- `mission_type`: `drag_drop`
- `sub_type`: `word_bank_fill`
- 필드:
  - `template`: 빈칸이 포함된 문장
  - `blanks`: 빈칸 수
  - `wordOptions`: 선택지 목록
  - `correctAnswers`: 정답 목록

```json
{
  "korean": "I see a tree.",
  "word": "tree",
  "sentence": "I see a tree.",
  "sentenceTokens": ["I", "see", "a", "tree"],
  "difficultyTier": 1,
  "sub_type": "word_bank_fill",
  "template": "I see a ___ .",
  "blanks": 1,
  "wordOptions": ["tree", "book", "dog", "car"],
  "correctAnswers": ["tree"]
}
```

### 2) word_order (순서 배열)
- `mission_type`: `drag_drop`
- `sub_type`: `word_order`
- 필드:
  - `template`: 빈칸들로만 구성된 문장
  - `blanks`: 토큰 수
  - `wordOptions`: 섞인 토큰 목록
  - `correctAnswers`: 정답 토큰 순서

```json
{
  "korean": "I see a tree.",
  "word": "tree",
  "sentence": "I see a tree.",
  "sentenceTokens": ["I", "see", "a", "tree"],
  "difficultyTier": 1,
  "sub_type": "word_order",
  "template": "___ ___ ___ ___",
  "blanks": 4,
  "wordOptions": ["tree", "I", "see", "a"],
  "correctAnswers": ["I", "see", "a", "tree"]
}
```

## keyboard 유형

### 3) blank_fill (빈칸 채우기)
- `mission_type`: `keyboard`
- `sub_type`: `blank_fill`
- 필드:
  - `template`: 빈칸 포함 문장
  - `blanks`: 빈칸 수
  - `correctAnswers`: 정답 목록

```json
{
  "korean": "I see a tree.",
  "word": "tree",
  "sentence": "I see a tree.",
  "sentenceTokens": ["I", "see", "a", "tree"],
  "difficultyTier": 1,
  "sub_type": "blank_fill",
  "template": "I see a ___ .",
  "blanks": 1,
  "correctAnswers": ["tree"]
}
```

### 4) sentence_write (문장 쓰기)
- `mission_type`: `keyboard`
- `sub_type`: `sentence_write`
- 필드:
  - `example`: 정답 문장
  - `vocabulary`: 힌트 단어 목록

```json
{
  "korean": "I see a tree.",
  "word": "tree",
  "sentence": "I see a tree.",
  "sentenceTokens": ["I", "see", "a", "tree"],
  "difficultyTier": 1,
  "sub_type": "sentence_write",
  "example": "I see a tree.",
  "vocabulary": ["I", "see", "a", "tree"]
}
```

### 5) copy_typing (문장 따라쓰기)
- `mission_type`: `keyboard`
- `sub_type`: `copy_typing`
- 필드:
  - `example`: 정답 문장
  - `vocabulary`: 힌트 단어 목록

### 6) dictation (받아쓰기)
- `mission_type`: `keyboard`
- `sub_type`: `dictation`
- 필드:
  - `example`: 정답 문장
  - `vocabulary`: 힌트 단어 목록

---

## 세부 타입 → mission_type 매핑

- `word_bank_fill` → `drag_drop`
- `word_order` → `drag_drop`
- `blank_fill` → `keyboard`
- `sentence_write` → `keyboard`
- `copy_typing` → `keyboard`
- `dictation` → `keyboard`
