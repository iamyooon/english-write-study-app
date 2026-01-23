# PowerShell 버전 - 커밋 전 테스트 실행 및 문서 업데이트를 포함한 커밋 스크립트

$ErrorActionPreference = "Continue"

Write-Host "🔍 커밋 전 검사 시작..." -ForegroundColor Cyan

# 1. 타입 체크
Write-Host "📝 타입 체크 실행 중..." -ForegroundColor Yellow
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 타입 체크 실패" -ForegroundColor Red
    exit 1
}

# 2. 테스트 실행
Write-Host "🧪 테스트 실행 중..." -ForegroundColor Yellow
npm test
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  일부 테스트 실패 (계속 진행)" -ForegroundColor Yellow
}

# 3. 문서 업데이트
Write-Host "📚 문서 업데이트 중..." -ForegroundColor Yellow
npm run update-docs
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  문서 업데이트 실패 (계속 진행)" -ForegroundColor Yellow
}

# 4. 변경사항 스테이징
Write-Host "📦 변경사항 스테이징 중..." -ForegroundColor Yellow
git add .

# 5. 커밋 메시지 입력 받기
Write-Host ""
$commitMessage = Read-Host "💬 커밋 메시지를 입력하세요"

if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    Write-Host "❌ 커밋 메시지가 비어있습니다." -ForegroundColor Red
    exit 1
}

# 6. 커밋
Write-Host "💾 커밋 중..." -ForegroundColor Yellow
git commit -m $commitMessage

# 7. 푸시 여부 확인
Write-Host ""
$pushConfirm = Read-Host "🚀 원격 저장소에 푸시하시겠습니까? (y/n)"

if ($pushConfirm -eq "y" -or $pushConfirm -eq "Y") {
    Write-Host "📤 푸시 중..." -ForegroundColor Yellow
    git push origin main
    Write-Host "✅ 푸시 완료!" -ForegroundColor Green
} else {
    Write-Host "⏭️  푸시를 건너뜁니다." -ForegroundColor Yellow
}

Write-Host "✅ 완료!" -ForegroundColor Green
