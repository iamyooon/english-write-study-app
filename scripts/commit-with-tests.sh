#!/bin/bash

# 커밋 전 테스트 실행 및 문서 업데이트를 포함한 커밋 스크립트

set -e

echo "🔍 커밋 전 검사 시작..."

# 1. 타입 체크
echo "📝 타입 체크 실행 중..."
npm run type-check || {
    echo "❌ 타입 체크 실패"
    exit 1
}

# 2. 테스트 실행
echo "🧪 테스트 실행 중..."
npm test || {
    echo "⚠️  일부 테스트 실패 (계속 진행)"
}

# 3. 문서 업데이트
echo "📚 문서 업데이트 중..."
npm run update-docs || {
    echo "⚠️  문서 업데이트 실패 (계속 진행)"
}

# 4. 변경사항 스테이징
echo "📦 변경사항 스테이징 중..."
git add .

# 5. 커밋 메시지 파일 생성 및 입력 받기
echo ""
COMMIT_MESSAGE_FILE="commit-message.txt"

# 기존 커밋 메시지 파일이 있으면 읽어서 표시
if [ -f "$COMMIT_MESSAGE_FILE" ]; then
    echo "📝 기존 커밋 메시지:"
    cat "$COMMIT_MESSAGE_FILE"
    echo ""
fi

echo "💬 커밋 메시지를 입력하세요 (여러 줄 입력 가능, 빈 줄 입력 후 Ctrl+D로 완료):"
COMMIT_MESSAGE=""
while IFS= read -r line; do
    if [ -z "$line" ] && [ -n "$COMMIT_MESSAGE" ]; then
        break
    fi
    if [ -n "$line" ]; then
        if [ -z "$COMMIT_MESSAGE" ]; then
            COMMIT_MESSAGE="$line"
        else
            COMMIT_MESSAGE="$COMMIT_MESSAGE"$'\n'"$line"
        fi
    fi
done

if [ -z "$COMMIT_MESSAGE" ]; then
    echo "❌ 커밋 메시지가 비어있습니다."
    exit 1
fi

# 커밋 메시지를 파일로 저장
echo "$COMMIT_MESSAGE" > "$COMMIT_MESSAGE_FILE"
echo "📝 커밋 메시지가 파일에 저장되었습니다: $COMMIT_MESSAGE_FILE"

# 6. 커밋 (파일 사용)
echo "💾 커밋 중..."
git commit -F "$COMMIT_MESSAGE_FILE"

# 7. 푸시 여부 확인
echo ""
echo "🚀 원격 저장소에 푸시하시겠습니까? (y/n)"
read -r push_confirm

if [ "$push_confirm" = "y" ] || [ "$push_confirm" = "Y" ]; then
    echo "📤 푸시 중..."
    git push origin main
    echo "✅ 푸시 완료!"
else
    echo "⏭️  푸시를 건너뜁니다."
fi

echo "✅ 완료!"
