# Jira 코멘트 한글 인코딩 문제 해결 가이드

## 문제
PowerShell 콘솔에서 한글을 직접 사용하면 인코딩이 깨집니다.

## 해결 방법

### 방법 1: 파일을 직접 작성 (가장 확실한 방법)

1. **메모장에서 파일 생성**
   - `jira-comment.txt` 파일을 생성
   - 내용 작성
   - **다른 이름으로 저장** → **인코딩: UTF-8** 선택 → 저장

2. **스크립트 실행**
   ```powershell
   node scripts/log-to-jira.mjs @jira-comment.txt --issue WEB-295
   ```

### 방법 2: 헬퍼 스크립트 사용

```powershell
# 파일 생성 (메모장이 열림)
node scripts/create-comment-file.mjs

# 파일에 내용 작성 후 저장

# 지라에 전송
node scripts/log-to-jira.mjs @jira-comment.txt --issue WEB-295
```

### 방법 3: PowerShell에서 UTF-8로 저장 (주의 필요)

```powershell
# UTF-8 (BOM 없음)로 저장
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
$content = "작업 요약 내용"
[System.IO.File]::WriteAllText("$PWD\jira-comment.txt", $content, $utf8NoBom)

# 지라에 전송
node scripts/log-to-jira.mjs @jira-comment.txt --issue WEB-295
```

## 확인 방법

파일이 제대로 저장되었는지 확인:

```powershell
node scripts/check-file-encoding.mjs jira-comment.txt
```

출력에서 "한글 정상 여부: true"가 나와야 합니다.

## 주의사항

- PowerShell 콘솔에서 한글을 직접 입력하면 이미 깨진 상태로 전달됩니다
- 반드시 파일로 저장하여 사용하세요
- 파일 저장 시 UTF-8 인코딩을 명시적으로 선택하세요
