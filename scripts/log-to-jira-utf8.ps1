# PowerShell UTF-8 인코딩 래퍼 스크립트
# 이 스크립트를 사용하면 한글 인코딩 문제를 해결할 수 있습니다
# 사용법: .\scripts\log-to-jira-utf8.ps1 "작업 요약" --issue WEB-295

# UTF-8 인코딩 설정
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::InputEncoding = [System.Text.Encoding]::UTF8

# 코드 페이지를 UTF-8로 변경
chcp 65001 | Out-Null

# 모든 인자를 그대로 전달 (이미 UTF-8로 설정됨)
# Node.js 스크립트 실행
node scripts/log-to-jira.mjs $args
