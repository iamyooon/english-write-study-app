# 레벨 시스템 제거 - 학년 중심 설계

## 변경 사항

**레벨 시스템을 완전히 제거하고 학년만 사용하도록 변경했습니다.**

## 새로운 설계

### 학년 중심 시스템

- **학년 (Grade)**: 1-6학년
  - Placement Test를 통해 적절한 학년 추천
  - 학년에 따라 자동으로 난이도 결정

### 학습 방식

- **저학년 (1-3학년)**: Drag & Drop 방식
  - 클릭 기반 단어 선택
  - 빈칸 1개로 구성된 간단한 문장
  
- **고학년 (4-6학년)**: 키보드 입력 방식
  - 직접 영어 문장 작성
  - 더 복잡한 문장 구조

### 학년별 난이도

**1학년:**
- 문장 길이: 3-5단어
- 문법: 기본 단어, 현재형, 단수/복수
- 예: "I like apples."

**2학년:**
- 문장 길이: 5-7단어
- 문법: 형용사, 부사 추가
- 예: "I really like red apples."

**3학년:**
- 문장 길이: 7-9단어
- 문법: 기본 전치사 추가
- 예: "I go to school every morning."

**4학년:**
- 문장 길이: 7-10단어
- 문법: 접속사(because, but, and)
- 예: "I wake up early every morning and exercise."

**5학년:**
- 문장 길이: 9-12단어
- 문법: 복합 문장
- 예: "I like apples, but I prefer oranges because they are sweeter."

**6학년:**
- 문장 길이: 11-15단어
- 문법: 시제 변화, 비교급, 복잡한 문장 구조
- 예: "Although I prefer oranges, I still enjoy eating apples occasionally."

## Placement Test

- **목적**: 적절한 학년 추천 (1-6학년)
- **평가 기준**: 실제 영어 실력만 평가
- **결과**: `recommended_grade` (1-6학년)

## 장점

1. **직관적**: 쉬우면 다음 학년으로 올라가는 것이 자연스러움
2. **단순함**: 레벨 관리 불필요
3. **명확함**: 학년만으로 난이도가 결정됨
4. **확장성**: 학년별로 다양한 난이도 문제 제공 가능
