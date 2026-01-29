#!/bin/sh
# Git hooks 설치 스크립트 (Unix/Linux/Mac)
# pre-commit hook을 설치하여 커밋 전 자동으로 테스트 실행

echo "🔧 Git hooks 설치 중..."

HOOKS_DIR=".git/hooks"
PRE_COMMIT_HOOK="$HOOKS_DIR/pre-commit"

# .git/hooks 디렉토리 확인
if [ ! -d "$HOOKS_DIR" ]; then
    echo "❌ .git/hooks 디렉토리를 찾을 수 없습니다."
    exit 1
fi

# pre-commit hook 내용 작성
cat > "$PRE_COMMIT_HOOK" << 'EOF'
#!/bin/sh
# Git pre-commit hook - 커밋 전 테스트 실행

# npm 스크립트 실행
npm run pre-commit

# npm 스크립트의 종료 코드를 그대로 전달
exit $?
EOF

# 실행 권한 부여
chmod +x "$PRE_COMMIT_HOOK"

echo "✅ pre-commit hook이 설치되었습니다."
echo "💡 이제 커밋할 때마다 자동으로 테스트가 실행됩니다."
