# 커밋 메시지 작성 가이드

## 한글 인코딩 문제 해결

한글 커밋 메시지의 인코딩 문제를 방지하기 위해 텍스트 파일을 사용하여 커밋하세요.

## 빠른 사용법 (권장)

### 방법 1: 스크립트 사용 (가장 간단)

```powershell
# 일반 커밋
.\commit.ps1 "커밋 메시지 내용"

# 커밋 메시지 수정
.\commit-amend.ps1 "새로운 커밋 메시지"
```

### 방법 2: 텍스트 파일 직접 사용

1. **commit-message.txt 파일에 커밋 메시지 작성** (UTF-8 인코딩)

2. **파일 참조하여 커밋**
   ```powershell
   git add -A
   git commit -F commit-message.txt
   git push
   ```

3. **기존 커밋 메시지 수정 (amend)**
   ```powershell
   git commit --amend -F commit-message.txt
   git push --force
   ```

## 주의사항

- 커밋 메시지 파일은 UTF-8 인코딩으로 저장되어야 합니다.
- PowerShell에서 파일을 생성할 때는 인코딩을 명시하세요:
  ```powershell
  $utf8NoBom = New-Object System.Text.UTF8Encoding $false
  [System.IO.File]::WriteAllText("commit-message.txt", $content, $utf8NoBom)
  ```

## 템플릿 사용

`.git-commit-template.txt` 파일을 수정하여 커밋 메시지를 작성하고:
```powershell
git commit -F .git-commit-template.txt
```

## 왜 이 방법을 사용하나요?

PowerShell에서 직접 `git commit -m "한글 메시지"`를 사용하면 인코딩 문제가 발생할 수 있습니다.
텍스트 파일을 사용하면 Git이 파일의 인코딩을 올바르게 처리합니다.
