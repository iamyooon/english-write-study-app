# GitHub 및 Vercel 배포 가이드

## 1. Git 설치 (아직 설치되지 않은 경우)

Windows에서 Git을 설치하려면:
1. https://git-scm.com/download/win 방문
2. 다운로드 후 설치
3. 새 PowerShell 창 열기

또는 winget을 사용:
```powershell
winget install Git.Git
```

## 2. Git 저장소 초기화 및 GitHub에 푸시

### Git 저장소 초기화
```powershell
git init
git add .
git commit -m "Initial commit: 영어 일기 쓰기 앱"
```

### GitHub 저장소 생성
1. https://github.com/new 방문
2. 저장소 이름 입력 (예: `english-write-study-app`)
3. Public 또는 Private 선택
4. "Create repository" 클릭
5. GitHub에서 제공하는 명령어 사용

### GitHub에 푸시
```powershell
git remote add origin https://github.com/YOUR_USERNAME/english-write-study-app.git
git branch -M main
git push -u origin main
```

## 3. Vercel에 배포

### 방법 1: Vercel 웹사이트에서 연결 (권장)

1. https://vercel.com 방문
2. "Sign Up" 또는 "Log In" (GitHub 계정으로 로그인 권장)
3. "Add New..." → "Project" 클릭
4. GitHub 저장소 선택
5. 프로젝트 설정:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (자동 설정됨)
   - **Output Directory**: `dist` (자동 설정됨)
   - **Install Command**: `npm install` (자동 설정됨)
6. "Deploy" 클릭

### 방법 2: Vercel CLI 사용

```powershell
# Vercel CLI 설치
npm.cmd install -g vercel

# Vercel에 로그인
vercel login

# 프로젝트 배포
vercel

# 프로덕션 배포
vercel --prod
```

## 4. 환경 변수 (필요한 경우)

Vercel 대시보드에서:
1. 프로젝트 선택
2. Settings → Environment Variables
3. 필요한 환경 변수 추가

## 5. 자동 배포

GitHub 저장소를 Vercel에 연결하면:
- `main` 브랜치에 푸시할 때마다 자동으로 배포됩니다
- Pull Request마다 Preview 배포가 생성됩니다

## 문제 해결

### Git이 인식되지 않는 경우
- Git 설치 후 **새 PowerShell 창**을 열어주세요
- 또는 `git.cmd` 사용: `git.cmd --version`

### Vercel 빌드 실패
- `package.json`에 `build` 스크립트가 있는지 확인
- `vercel.json` 파일이 올바른지 확인
- Vercel 로그에서 오류 메시지 확인

