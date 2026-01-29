# Git hooks 설치 스크립트
# pre-commit hook을 설치하여 커밋 전 자동으로 테스트 실행

Write-Host "🔧 Git hooks 설치 중..." -ForegroundColor Cyan

$hooksDir = ".git\hooks"
$preCommitHook = "$hooksDir\pre-commit"

# .git/hooks 디렉토리 확인
if (-not (Test-Path $hooksDir)) {
    Write-Host "❌ .git/hooks 디렉토리를 찾을 수 없습니다." -ForegroundColor Red
    exit 1
}

# pre-commit hook 내용 작성
$hookContent = @"
#!/bin/sh
# Git pre-commit hook - 커밋 전 테스트 실행

# npm 스크립트 실행 (Windows에서도 동작)
npm run pre-commit

# npm 스크립트의 종료 코드를 그대로 전달
exit `$?
"@

# pre-commit hook 파일 생성
$hookContent | Out-File -FilePath $preCommitHook -Encoding ASCII -NoNewline

# 실행 권한 부여 (Unix 시스템용, Windows에서는 무시됨)
if (Get-Command chmod -ErrorAction SilentlyContinue) {
    chmod +x $preCommitHook
}

Write-Host "✅ pre-commit hook이 설치되었습니다." -ForegroundColor Green
Write-Host "💡 이제 커밋할 때마다 자동으로 테스트가 실행됩니다." -ForegroundColor Cyan
