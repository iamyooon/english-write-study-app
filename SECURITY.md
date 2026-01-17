# 보안 가이드 (Security Guide)

## 🔐 민감한 정보 관리

이 프로젝트는 API 키와 토큰 같은 민감한 정보를 사용합니다. 이러한 정보는 **절대** 공개 저장소에 커밋하지 마세요.

## 📋 필요한 환경 변수

### 프론트엔드 (Vite)

- `VITE_OPENAI_API_KEY`: OpenAI API 키 (필수)

### 로컬 스크립트 (Node.js)

- `JIRA_URL`: Jira 인스턴스 URL
- `JIRA_EMAIL`: Jira 계정 이메일
- `JIRA_API_TOKEN`: Jira API 토큰
- `JIRA_PROJECT_KEY`: Jira 프로젝트 키
- `DEFAULT_ISSUE_KEY`: 기본 이슈 키

## 🛡️ 보안 모범 사례

### 1. 환경 변수 파일 관리

```bash
# ✅ 올바른 방법
# .env 파일을 로컬에만 보관 (Git에 커밋하지 않음)
# .env.example 파일을 사용하여 필요한 환경 변수 템플릿 제공

# ❌ 잘못된 방법
# .env 파일을 Git에 커밋
# API 키를 코드에 하드코딩
```

### 2. .env 파일 설정

1. `.env.example` 파일을 복사하여 `.env` 파일 생성:
   ```bash
   cp .env.example .env
   ```

2. `.env` 파일에 실제 값 입력:
   ```env
   VITE_OPENAI_API_KEY=sk-실제키값
   JIRA_API_TOKEN=실제토큰값
   ```

3. `.env` 파일은 `.gitignore`에 포함되어 있어 Git에 커밋되지 않습니다.

### 3. 배포 환경 설정

#### Vercel 배포 시

1. Vercel 대시보드 접속: https://vercel.com/dashboard
2. 프로젝트 선택
3. **Settings** → **Environment Variables**
4. 환경 변수 추가:
   - `VITE_OPENAI_API_KEY`: OpenAI API 키
5. **Save** 후 **Redeploy**

자세한 내용은 [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md) 참고

#### GitHub Actions (CI/CD) 사용 시

GitHub Secrets를 사용하여 환경 변수를 안전하게 관리:

1. GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret** 클릭
3. Secret 이름과 값 입력
4. GitHub Actions 워크플로우에서 사용:
   ```yaml
   env:
     VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}
   ```

### 4. API 키 발급 방법

#### OpenAI API 키

1. https://platform.openai.com/api-keys 접속
2. 계정 생성 또는 로그인
3. "Create new secret key" 클릭
4. 키 이름 입력 (예: "english-write-study-app")
5. 생성된 키 복사 (한 번만 표시되므로 안전하게 보관)
6. `.env` 파일 또는 Vercel 환경 변수에 설정

#### Jira API 토큰

1. https://id.atlassian.com/manage-profile/security/api-tokens 접속
2. "Create API token" 클릭
3. 토큰 이름 입력 (예: "Cursor Logger")
4. 생성된 토큰 복사
5. `.env` 파일에 설정

## ⚠️ 보안 체크리스트

배포 전 확인사항:

- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는지 확인
- [ ] 코드에 하드코딩된 API 키나 토큰이 없는지 확인
- [ ] `.env.example` 파일에 실제 값이 아닌 템플릿만 있는지 확인
- [ ] 배포 환경(Vercel 등)에 환경 변수가 올바르게 설정되어 있는지 확인
- [ ] 공개 저장소에 민감한 정보가 커밋되지 않았는지 확인

## 🚨 문제 발생 시 대응 방법

### API 키가 GitHub에 노출된 경우

1. **즉시 키 무효화**:
   - OpenAI: https://platform.openai.com/api-keys 에서 키 삭제
   - Jira: https://id.atlassian.com/manage-profile/security/api-tokens 에서 토큰 삭제

2. **새 키 발급**:
   - 위의 "API 키 발급 방법" 참고하여 새 키 발급

3. **Git 히스토리에서 제거** (필요 시):
   ```bash
   # git-filter-repo 사용 (권장)
   git filter-repo --path .env --invert-paths
   
   # 또는 BFG Repo-Cleaner 사용
   # https://rtyley.github.io/bfg-repo-cleaner/
   ```

4. **새 키로 업데이트**:
   - 로컬 `.env` 파일 업데이트
   - 배포 환경(Vercel 등) 환경 변수 업데이트

### .env 파일이 실수로 커밋된 경우

1. Git에서 제거:
   ```bash
   git rm --cached .env
   git commit -m "Remove .env file from tracking"
   ```

2. `.gitignore` 확인:
   ```bash
   # .gitignore에 .env가 있는지 확인
   cat .gitignore | grep .env
   ```

## 📚 추가 리소스

- [GitHub Secrets 문서](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Vercel 환경 변수 문서](https://vercel.com/docs/concepts/projects/environment-variables)
- [OpenAI API 키 관리](https://platform.openai.com/api-keys)
- [Atlassian API 토큰 관리](https://id.atlassian.com/manage-profile/security/api-tokens)

## 🔍 코드 검사

다음 명령어로 코드에 하드코딩된 키가 있는지 확인할 수 있습니다:

```bash
# API 키 패턴 검색 (예시)
grep -r "sk-[a-zA-Z0-9]" --exclude-dir=node_modules --exclude="*.md" .
grep -r "ATATT" --exclude-dir=node_modules --exclude="*.md" .
```

**주의**: 검색 결과에 실제 키가 포함되어 있다면 즉시 무효화하고 새 키를 발급하세요.

---

**마지막 업데이트**: 2024년  
**문서 버전**: 1.0

