# 커밋 메시지 파일 생성 스크립트 (UTF-8 인코딩 보장)
# 사용법: .\scripts\create-commit-message.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

# PowerShell 인코딩 설정
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$commitMessageFile = "commit-message.txt"

# UTF-8 BOM 없이 파일 작성 (Git이 선호하는 형식)
# 명시적으로 UTF-8 인코딩 사용
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($commitMessageFile, $Message, $utf8NoBom)

# 파일이 제대로 작성되었는지 확인
$fileContent = [System.IO.File]::ReadAllText($commitMessageFile, $utf8NoBom)
if ($fileContent -eq $Message) {
    Write-Host "✅ 커밋 메시지 파일 생성 완료: $commitMessageFile" -ForegroundColor Green
} else {
    Write-Host "⚠️ 파일 내용이 일치하지 않습니다. 다시 시도하세요." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "다음 명령어로 커밋하세요:" -ForegroundColor Yellow
Write-Host "  git commit -F $commitMessageFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️ 중요: Git 설정이 UTF-8로 되어 있는지 확인하세요:" -ForegroundColor Yellow
Write-Host "  git config --global i18n.commitencoding utf-8" -ForegroundColor Cyan
Write-Host "  git config --global i18n.logoutputencoding utf-8" -ForegroundColor Cyan
Write-Host ""
Write-Host "커밋 후 파일 삭제:" -ForegroundColor Yellow
Write-Host "  Remove-Item $commitMessageFile" -ForegroundColor Cyan
