# Git 한글 인코딩 문제 해결 가이드

## 문제
Git 커밋 메시지나 파일 이름의 한글이 깨져서 표시되는 경우

## 해결 방법

### 1. Git 전역 설정 변경 (완료됨)

다음 명령어들이 실행되었습니다:

```powershell
git config --global core.quotepath false
git config --global i18n.commitencoding utf-8
git config --global i18n.logoutputencoding utf-8
```

### 2. PowerShell 인코딩 설정

PowerShell에서 UTF-8 출력을 위해:

```powershell
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:LANG = "ko_KR.UTF-8"
```

또는 PowerShell 프로필에 추가:

```powershell
# 프로필 확인
$PROFILE

# 프로필 편집
notepad $PROFILE

# 다음 내용 추가
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$env:LANG = "ko_KR.UTF-8"
```

### 3. Git Bash 사용 (권장)

Windows에서 Git Bash를 사용하면 한글 인코딩 문제가 적습니다:

1. Git Bash 실행
2. 다음 명령어로 설정 확인:
```bash
git config --global --list | grep encoding
```

### 4. 기존 커밋 메시지 수정

마지막 커밋 메시지를 수정하려면:

```powershell
git commit --amend -m "새로운 커밋 메시지"
git push --force origin main  # 주의: force push는 신중하게!
```

## 확인

설정이 제대로 적용되었는지 확인:

```powershell
git config --global --list | Select-String encoding
git config --global --list | Select-String quotepath
```

## 참고

- `core.quotepath false`: 파일 이름의 특수문자를 그대로 표시
- `i18n.commitencoding utf-8`: 커밋 메시지를 UTF-8로 저장
- `i18n.logoutputencoding utf-8`: 로그 출력을 UTF-8로 표시
