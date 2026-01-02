# Git 사용자 설정 및 커밋 가이드

## Git 사용자 정보 설정

커밋하기 전에 Git 사용자 정보를 설정해야 합니다.

### GitHub 계정 정보로 설정 (권장)

```powershell
git config --global user.name "Your GitHub Username"
git config --global user.email "your-email@example.com"
```

**예시:**
```powershell
git config --global user.name "john-doe"
git config --global user.email "john.doe@example.com"
```

### 현재 저장소에만 설정 (임시)

전역 설정 없이 현재 프로젝트에만 설정하려면:

```powershell
git config user.name "Your Name"
git config user.email "your-email@example.com"
```

## 커밋 실행

사용자 정보를 설정한 후:

```powershell
git commit -m "Initial commit: 영어 일기 쓰기 앱 with tests"
```

## 다음 단계

커밋이 완료되면 `DEPLOY_STEPS.md` 파일의 지침을 따르세요.

