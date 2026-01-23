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

# 3. 테스트 실행
echo "🧪 테스트 실행 중..."
npm test || {
    echo "❌ 테스트 실패"
    exit 1
}

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
