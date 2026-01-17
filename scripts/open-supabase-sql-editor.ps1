# Supabase SQL Editor 열기 스크립트
# PowerShell에서 실행: .\scripts\open-supabase-sql-editor.ps1

$projectId = "ilgwjhtjdaghgwapwcki"
$sqlEditorUrl = "https://supabase.com/dashboard/project/$projectId/sql/new"

Write-Host "🌐 Supabase SQL Editor를 엽니다..." -ForegroundColor Green
Start-Process $sqlEditorUrl

Write-Host "`n📋 다음 단계:" -ForegroundColor Yellow
Write-Host "1. 열린 브라우저에서 SQL Editor가 표시됩니다"
Write-Host "2. 아래 SQL 파일 내용을 복사하세요:"
Write-Host "   supabase/migrations/002_rls_policies.sql" -ForegroundColor Cyan
Write-Host "3. SQL Editor에 붙여넣기"
Write-Host "4. Run 버튼 클릭`n"

# SQL 파일 내용 읽기
$sqlPath = Join-Path $PSScriptRoot "..\supabase\migrations\002_rls_policies.sql"
if (Test-Path $sqlPath) {
    Write-Host "📄 SQL 파일 내용:" -ForegroundColor Green
    Write-Host "─────────────────────────────────────────" -ForegroundColor Gray
    Get-Content $sqlPath -Raw
    Write-Host "─────────────────────────────────────────" -ForegroundColor Gray
    Write-Host "`n💡 위 내용을 복사하여 SQL Editor에 붙여넣으세요.`n" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  SQL 파일을 찾을 수 없습니다: $sqlPath" -ForegroundColor Red
}
