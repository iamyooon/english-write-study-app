# GitHub 푸시 가이드

## 현재 상태
- ✅ Git 저장소 초기화 완료
- ✅ 파일 커밋 완료
- ✅ Remote 저장소 추가 완료 (https://github.com/iamyooon/english-write-study-app.git)

## 푸시 방법

GitHub에 푸시하려면 인증이 필요합니다. 다음 중 하나의 방법을 사용하세요:

### 방법 1: Personal Access Token 사용 (권장)

1. GitHub에서 Personal Access Token 생성:
   - https://github.com/settings/tokens 방문
   - "Generate new token" → "Generate new token (classic)" 클릭
   - Token 이름 입력 (예: "english-write-study-app")
   - 권한 선택: `repo` 체크
   - "Generate token" 클릭
   - **토큰을 복사해두세요** (한 번만 표시됨)

2. 푸시할 때 사용:
```powershell
# URL에 토큰 포함 (USERNAME을 본인 사용자명으로 변경)
git push -u origin main
# 사용자 이름: iamyooon
# 비밀번호: (Personal Access Token 붙여넣기)
```

또는:
```powershell
git remote set-url origin https://YOUR_TOKEN@github.com/iamyooon/english-write-study-app.git
git push -u origin main
```

### 방법 2: GitHub Desktop 사용

1. GitHub Desktop 다운로드: https://desktop.github.com/
2. 설치 후 GitHub 계정으로 로그인
3. File → Add Local Repository
4. 프로젝트 폴더 선택
5. "Publish repository" 클릭

### 방법 3: SSH 키 사용

SSH 키가 설정되어 있다면:
```powershell
git remote set-url origin git@github.com:iamyooon/english-write-study-app.git
git push -u origin main
```

## 다음 단계 (푸시 완료 후)

푸시가 성공하면:
1. https://github.com/iamyooon/english-write-study-app 에서 코드 확인
2. Vercel에 배포 진행

