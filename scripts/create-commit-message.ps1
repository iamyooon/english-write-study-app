# 커밋 메시지 파일 생성 스크립트 (UTF-8 인코딩 보장)
# 사용법: .\scripts\create-commit-message.ps1

param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

$commitMessageFile = "commit-message.txt"

# UTF-8 BOM 없이 파일 작성 (Git이 선호하는 형식)
[System.IO.File]::WriteAllText($commitMessageFile, $Message, [System.Text.UTF8Encoding]::new($false))

Write-Host "✅ 커밋 메시지 파일 생성 완료: $commitMessageFile" -ForegroundColor Green
Write-Host ""
Write-Host "다음 명령어로 커밋하세요:" -ForegroundColor Yellow
Write-Host "  git commit -F $commitMessageFile" -ForegroundColor Cyan
Write-Host ""
Write-Host "커밋 후 파일 삭제:" -ForegroundColor Yellow
Write-Host "  Remove-Item $commitMessageFile" -ForegroundColor Cyan
