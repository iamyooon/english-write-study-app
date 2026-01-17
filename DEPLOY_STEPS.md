# GitHub 및 Vercel 배포 단계별 가이드

## ✅ 완료된 단계
- [x] Git 저장소 초기화
- [x] 파일 커밋

## 다음 단계

### 1. GitHub 저장소 생성

1. 브라우저에서 https://github.com/new 방문
2. 저장소 설정:
   - **Repository name**: `english-write-study-app` (원하는 이름)
   - **Description**: "영어 일기 쓰기 및 AI 문법 교정 앱"
   - **Visibility**: Public 또는 Private 선택
   - **⚠️ 중요**: README, .gitignore, license는 추가하지 마세요 (이미 프로젝트에 있음)
3. "Create repository" 버튼 클릭

### 2. GitHub에 푸시

GitHub 저장소를 생성한 후, 다음 명령어를 실행하세요:

```powershell
# GitHub에서 제공하는 저장소 URL을 사용하세요
# 예: https://github.com/YOUR_USERNAME/english-write-study-app.git
git remote add origin https://github.com/YOUR_USERNAME/english-write-study-app.git
git branch -M main
git push -u origin main
```

**주의**: `YOUR_USERNAME`을 본인의 GitHub 사용자 이름으로 변경하세요.

### 3. Vercel에 배포

#### 방법 1: Vercel 웹사이트 (권장)

1. https://vercel.com 방문
2. "Sign Up" 또는 "Log In" (GitHub 계정으로 로그인 권장)
3. "Add New..." → "Project" 클릭
4. "Import Git Repository"에서 방금 만든 GitHub 저장소 선택
5. 프로젝트 설정 확인:
   - **Framework Preset**: Vite (자동 감지)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` (자동 설정)
   - **Output Directory**: `dist` (자동 설정)
   - **Install Command**: `npm install` (자동 설정)
6. "Deploy" 버튼 클릭

#### 방법 2: Vercel CLI

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

### 4. 자동 배포 설정

GitHub 저장소를 Vercel에 연결하면:
- ✅ `main` 브랜치에 푸시할 때마다 자동으로 배포됩니다
- ✅ Pull Request마다 Preview 배포가 생성됩니다
- ✅ 배포 URL이 자동으로 제공됩니다

### 5. 배포 확인

배포가 완료되면:
- Vercel 대시보드에서 배포 상태 확인
- 제공된 URL로 앱 접속 테스트
- 배포 로그에서 오류 확인 (있는 경우)

## 문제 해결

### Git 인증 오류
GitHub에 푸시할 때 인증이 필요한 경우:
- Personal Access Token 사용 또는
- GitHub Desktop 사용 또는
- SSH 키 설정

### Vercel 빌드 실패
- Vercel 대시보드의 "Deployments" 탭에서 로그 확인
- `package.json`에 `build` 스크립트가 있는지 확인
- 환경 변수가 필요한지 확인

## 추가 정보

- Vercel 문서: https://vercel.com/docs
- Git 문서: https://git-scm.com/doc
- GitHub 문서: https://docs.github.com

