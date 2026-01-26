# 커밋 메시지 수정 스크립트 - 한글 인코딩 문제 방지
# 사용법: .\commit-amend.ps1 "새로운 커밋 메시지"

param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

# UTF-8 인코딩으로 커밋 메시지 파일 생성
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("commit-message.txt", $Message, $utf8NoBom)

# 파일 참조하여 커밋 수정
git commit --amend -F commit-message.txt

Write-Host "커밋 메시지 수정 완료: $Message" -ForegroundColor Green
Write-Host "푸시하려면: git push --force" -ForegroundColor Yellow
