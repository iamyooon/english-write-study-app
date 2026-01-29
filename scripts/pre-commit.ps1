# PowerShell 버전 - 커밋 전 자동 실행 스크립트
# 테스트 실행 및 문서 업데이트

$ErrorActionPreference = "Stop"

# Git hook이 없으면 자동으로 설치
$preCommitHook = ".git\hooks\pre-commit"
if (-not (Test-Path $preCommitHook)) {
    Write-Host "⚠️  Git hook이 없습니다. 자동으로 설치합니다..." -ForegroundColor Yellow
    npm run install-hooks
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Git hook 설치 실패" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🔍 커밋 전 검사 시작..." -ForegroundColor Cyan

# 1. 타입 체크
Write-Host "📝 타입 체크 실행 중..." -ForegroundColor Yellow
npm run type-check
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ 타입 체크 실패" -ForegroundColor Red
    exit 1
}

# 2. 린트 체크
Write-Host "🔍 린트 체크 실행 중..." -ForegroundColor Yellow
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  린트 경고 발생 (계속 진행)" -ForegroundColor Yellow
}

# 3. 단위 테스트 실행
Write-Host "🧪 단위 테스트 실행 중..." -ForegroundColor Yellow
$unitTestOutput = npm run test 2>&1 | Tee-Object -Variable unitTestResult
$unitTestExitCode = $LASTEXITCODE

if ($unitTestExitCode -ne 0) {
    Write-Host "❌ 단위 테스트 실패" -ForegroundColor Red
    exit 1
}

# 단위 테스트 결과 요약 추출 (더 상세한 정보 포함)
$unitTestSummary = ($unitTestResult | Select-Object -Last 30 | Out-String)
$unitTestStats = ($unitTestResult | Select-String -Pattern "(Test Files|Tests)" | Select-Object -Last 2 | Out-String)

# 4. E2E 테스트 실행
Write-Host "🎭 E2E 테스트 실행 중..." -ForegroundColor Yellow
$e2eTestOutput = npm run test:e2e 2>&1 | Tee-Object -Variable e2eTestResult
$e2eTestExitCode = $LASTEXITCODE

if ($e2eTestExitCode -ne 0) {
    Write-Host "❌ E2E 테스트 실패" -ForegroundColor Red
    exit 1
}

# E2E 테스트 결과 요약 추출 (더 상세한 정보 포함)
$e2eTestSummary = ($e2eTestResult | Select-Object -Last 50 | Out-String)
$e2eTestStats = ($e2eTestResult | Select-String -Pattern "(passed|failed|skipped)" | Select-Object -Last 1 | Out-String)

# 테스트 결과를 파일로 저장 (prepare-commit-msg에서 사용)
$testResultsContent = @"

## 테스트 결과

### 단위 테스트 (Vitest)
``````
$unitTestStats
$unitTestSummary
``````

### E2E 테스트 (Playwright)
``````
$e2eTestStats
$e2eTestSummary
``````
"@

$testResultsFilePath = Join-Path $env:TEMP "pre-commit-test-results.txt"
$testResultsContent | Out-File -FilePath $testResultsFilePath -Encoding UTF8
Write-Host "📝 테스트 결과 저장: $testResultsFilePath" -ForegroundColor Cyan

# 4. 문서 업데이트 필요성 확인
Write-Host ""
Write-Host "📚 문서 업데이트 확인 중..." -ForegroundColor Yellow
node scripts/check-docs-update.cjs
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  문서 확인 중 오류 발생 (계속 진행)" -ForegroundColor Yellow
}

# 5. 문서 업데이트로 인한 변경사항을 스테이징 영역에 추가
Write-Host "📦 문서 변경사항 스테이징 중..." -ForegroundColor Yellow
$docFiles = @("README.md", "IMPLEMENTATION_STATUS.md")
$hasChanges = $false

foreach ($file in $docFiles) {
    if (Test-Path $file) {
        # git diff로 변경사항 확인 (스테이징되지 않은 변경사항)
        $unstagedOutput = git diff --name-only $file 2>&1
        $unstagedChanges = if ($unstagedOutput -and $unstagedOutput -notmatch "error") { $unstagedOutput } else { $null }
        
        # git diff --cached로 스테이징된 변경사항 확인
        $stagedOutput = git diff --cached --name-only $file 2>&1
        $stagedChanges = if ($stagedOutput -and $stagedOutput -notmatch "error") { $stagedOutput } else { $null }
        
        if ($unstagedChanges -or $stagedChanges) {
            Write-Host "  - $file 변경사항 발견" -ForegroundColor Cyan
            # 스테이징되지 않은 변경사항이 있으면 스테이징
            if ($unstagedChanges) {
                git add $file
                Write-Host "    -> 스테이징 완료" -ForegroundColor Green
            } else {
                Write-Host "    -> 이미 스테이징됨" -ForegroundColor Gray
            }
            $hasChanges = $true
        }
    }
}

if ($hasChanges) {
    Write-Host "✅ 문서 변경사항이 스테이징되었습니다. 커밋에 포함됩니다." -ForegroundColor Green
    Write-Host "💡 다음 커밋에 문서 변경사항이 포함됩니다." -ForegroundColor Cyan
} else {
    Write-Host "ℹ️  문서 변경사항이 없습니다." -ForegroundColor Gray
}

Write-Host "All checks passed!" -ForegroundColor Green
exit 0
