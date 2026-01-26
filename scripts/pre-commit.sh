#!/bin/bash

# 커밋 전 자동 실행 스크립트
# 테스트 실행 및 문서 업데이트

set -e  # 에러 발생 시 중단

echo "🔍 커밋 전 검사 시작..."

# 1. 타입 체크
echo "📝 타입 체크 실행 중..."
npm run type-check || {
    echo "❌ 타입 체크 실패"
    exit 1
}

# 2. 린트 체크
echo "🔍 린트 체크 실행 중..."
npm run lint || {
    echo "⚠️  린트 경고 발생 (계속 진행)"
}

# 3. 단위 테스트 실행
echo "🧪 단위 테스트 실행 중..."
npm run test > /tmp/test-results-unit.txt 2>&1
UNIT_TEST_EXIT_CODE=$?
cat /tmp/test-results-unit.txt

if [ $UNIT_TEST_EXIT_CODE -ne 0 ]; then
    echo "❌ 단위 테스트 실패"
    exit 1
fi

# 테스트 결과 요약 추출 (더 상세한 정보 포함)
UNIT_TEST_SUMMARY=$(tail -n 30 /tmp/test-results-unit.txt | grep -E "(Test Files|Tests|Time|passed|failed|✓|×)" | head -n 10 || echo "단위 테스트 완료")

# 단위 테스트 통계 추출
UNIT_TEST_STATS=$(grep -E "(Test Files|Tests)" /tmp/test-results-unit.txt | tail -n 2 || echo "")

# 4. E2E 테스트 실행
echo "🎭 E2E 테스트 실행 중..."
npm run test:e2e > /tmp/test-results-e2e.txt 2>&1
E2E_TEST_EXIT_CODE=$?
cat /tmp/test-results-e2e.txt

if [ $E2E_TEST_EXIT_CODE -ne 0 ]; then
    echo "❌ E2E 테스트 실패"
    exit 1
fi

# E2E 테스트 결과 요약 추출 (더 상세한 정보 포함)
E2E_TEST_SUMMARY=$(tail -n 50 /tmp/test-results-e2e.txt | grep -E "(passed|failed|skipped|Tests|✓|×)" | head -n 15 || echo "E2E 테스트 완료")

# E2E 테스트 통계 추출
E2E_TEST_STATS=$(grep -E "(passed|failed|skipped)" /tmp/test-results-e2e.txt | tail -n 1 || echo "")

# 테스트 결과를 파일로 저장 (prepare-commit-msg에서 사용)
cat > /tmp/pre-commit-test-results.txt << EOF

## 테스트 결과

### 단위 테스트 (Vitest)
\`\`\`
$UNIT_TEST_STATS
$UNIT_TEST_SUMMARY
\`\`\`

### E2E 테스트 (Playwright)
\`\`\`
$E2E_TEST_STATS
$E2E_TEST_SUMMARY
\`\`\`
EOF

echo "📝 테스트 결과 저장 완료: /tmp/pre-commit-test-results.txt"

# 4. 문서 업데이트 (자동으로 최신 상태 반영)
echo "📚 문서 업데이트 중..."
node scripts/update-docs.js || {
    echo "⚠️  문서 업데이트 실패 (계속 진행)"
}

# 5. 문서 업데이트로 인한 변경사항을 스테이징 영역에 추가
echo "📦 문서 변경사항 스테이징 중..."
DOC_FILES=("README.md" "IMPLEMENTATION_STATUS.md")
HAS_CHANGES=false

for file in "${DOC_FILES[@]}"; do
    if [ -f "$file" ]; then
        if git diff --quiet "$file" 2>/dev/null; then
            # 변경사항이 없음
            :
        else
            echo "  - $file 변경사항 발견"
            git add "$file"
            HAS_CHANGES=true
        fi
    fi
done

if [ "$HAS_CHANGES" = true ]; then
    echo "✅ 문서 변경사항이 스테이징되었습니다. 커밋에 포함됩니다."
else
    echo "ℹ️  문서 변경사항이 없습니다."
fi

echo "✅ 모든 검사 통과!"
exit 0
