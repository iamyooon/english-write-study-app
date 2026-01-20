# 커밋 메시지 한글 인코딩 문제 해결 가이드

## 문제 상황
PowerShell에서 `git commit -m "한글 메시지"`를 사용하면 한글이 깨져서 저장되는 문제가 발생합니다.

## 해결 방법

### 방법 1: 파일로 작성하여 커밋 (권장)

1. **커밋 메시지를 파일로 작성**:
   ```powershell
   # PowerShell에서 UTF-8 파일 생성
   $message = @"
   feat: 기능 설명
   
   ## 변경 사항
   - 변경사항 1
   "@
   $utf8NoBom = New-Object System.Text.UTF8Encoding $false
   [System.IO.File]::WriteAllText("commit-message.txt", $message, $utf8NoBom)
   ```

2. **파일로 커밋**:
   ```powershell
   git commit -F commit-message.txt
   ```

3. **파일 삭제**:
   ```powershell
   Remove-Item commit-message.txt
   ```

### 방법 2: 스크립트 사용

**PowerShell 스크립트 사용**:
```powershell
.\scripts\create-commit-message.ps1 "feat: 기능 설명

## 변경 사항
- 변경사항 1"
git commit -F commit-message.txt
Remove-Item commit-message.txt
```

**Node.js 스크립트 사용**:
```bash
node scripts/create-commit-message.mjs "feat: 기능 설명

## 변경 사항
- 변경사항 1"
git commit -F commit-message.txt
Remove-Item commit-message.txt
```

### 방법 3: Git GUI 사용

1. **Git GUI 실행**:
   ```powershell
   git gui
   ```

2. Git GUI에서 커밋 메시지를 직접 입력 (한글이 정상적으로 표시됨)

3. "Commit" 버튼 클릭

### 방법 4: VS Code 사용

1. **변경사항 스테이징**:
   ```powershell
   git add .
   ```

2. **VS Code에서 커밋**:
   - VS Code의 Source Control 탭 열기
   - 커밋 메시지 입력 (한글 정상 입력 가능)
   - 커밋 버튼 클릭

## Git 설정 확인

다음 명령어로 Git 설정이 UTF-8로 되어 있는지 확인하세요:

```powershell
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
git config --global core.quotepath false
```

## 참고사항

- PowerShell 콘솔에서 `git log`를 실행하면 한글이 깨져 보일 수 있습니다.
- 이는 PowerShell 콘솔의 인코딩 문제이며, 실제 저장된 커밋 메시지는 정상일 수 있습니다.
- GitHub 웹사이트에서 커밋 메시지를 확인하면 정상적으로 표시됩니다.
- VS Code나 Git GUI를 사용하면 한글 입력이 더 안정적입니다.

## 문제가 계속되는 경우

1. **GitHub에서 실제 커밋 메시지 확인**:
   - GitHub 웹사이트에서 커밋을 확인하여 실제로 깨졌는지 확인
   - 웹사이트에서도 깨져 있다면 실제 인코딩 문제

2. **영어로 커밋 메시지 작성** (임시 해결책):
   - 한글 대신 영어로 커밋 메시지 작성
   - Jira 코멘트에 한글 설명 추가

3. **다른 터미널 사용**:
   - Git Bash 사용 (Windows)
   - WSL 사용 (Windows Subsystem for Linux)
