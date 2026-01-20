# Jira 설정 가이드

Jira API를 사용하여 작업 요약을 자동으로 기록하는 설정 방법입니다.

## 1. Jira API 토큰 발급

### 1.1 Atlassian 계정 접속
1. https://id.atlassian.com/manage-profile/security/api-tokens 접속
2. Atlassian 계정으로 로그인

### 1.2 API 토큰 생성
1. "Create API token" 클릭
2. 토큰 이름 입력 (예: "English Write Study App")
3. "Create" 클릭
4. **생성된 토큰을 복사해두세요** (한 번만 표시됨!)

## 2. Jira 프로젝트 및 이슈 확인

### 2.1 Jira 웹사이트 접속
1. https://wewakecorp.atlassian.net 접속
2. 프로젝트 선택 (예: WEB)

### 2.2 이슈 키 확인
1. 작업을 기록할 이슈를 선택하거나 생성
2. 이슈 키 확인 (예: `WEB-295`, `WEB-123` 등)
3. 이슈 키를 메모해두세요

## 3. 환경 변수 설정

### 3.1 `.env.local` 파일 확인/생성
프로젝트 루트에 `.env.local` 파일이 있는지 확인하고, 없으면 생성합니다.

### 3.2 Jira 설정 추가
`.env.local` 파일에 다음 내용을 추가합니다:

```env
# Jira Configuration
JIRA_URL=https://wewakecorp.atlassian.net
JIRA_EMAIL=your-email@wewakecorp.com
JIRA_API_TOKEN=your-api-token-here
JIRA_PROJECT_KEY=WEB
DEFAULT_ISSUE_KEY=WEB-295
```

**설정 값 설명**:
- `JIRA_URL`: Jira 인스턴스 URL
- `JIRA_EMAIL`: Atlassian 계정 이메일
- `JIRA_API_TOKEN`: 1단계에서 발급받은 API 토큰
- `JIRA_PROJECT_KEY`: 프로젝트 키 (예: WEB)
- `DEFAULT_ISSUE_KEY`: 기본 이슈 키 (작업 요약을 기록할 이슈)

## 4. 연결 테스트

### 4.1 스크립트로 테스트
터미널에서 다음 명령어를 실행하여 연결을 테스트합니다:

```bash
# Jira 연결 테스트 (jira-logger.js 사용)
node scripts/jira-logger.js --test

# 또는 직접 API 테스트
node -e "
const fs = require('fs');
function loadEnv() {
  const files = ['.env.local', '.env'];
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      content.split('\n').forEach(line => {
        const [key, ...vals] = line.split('=');
        if (key && vals.length && !process.env[key.trim()]) {
          process.env[key.trim()] = vals.join('=').trim();
        }
      });
    } catch(e) {}
  });
}
loadEnv();
const url = process.env.JIRA_URL;
const email = process.env.JIRA_EMAIL;
const token = process.env.JIRA_API_TOKEN;
const auth = Buffer.from(email + ':' + token).toString('base64');
fetch(url + '/rest/api/3/myself', {
  headers: { 'Authorization': 'Basic ' + auth, 'Accept': 'application/json' }
}).then(r => r.json()).then(d => {
  console.log('✅ 연결 성공!');
  console.log('사용자:', d.displayName);
  console.log('이메일:', d.emailAddress);
}).catch(e => console.error('❌ 오류:', e.message));
"
```

### 4.2 이슈 접근 테스트
특정 이슈에 접근할 수 있는지 테스트합니다:

```bash
node -e "
const fs = require('fs');
function loadEnv() {
  const files = ['.env.local', '.env'];
  files.forEach(file => {
    try {
      const content = fs.readFileSync(file, 'utf-8');
      content.split('\n').forEach(line => {
        const [key, ...vals] = line.split('=');
        if (key && vals.length && !process.env[key.trim()]) {
          process.env[key.trim()] = vals.join('=').trim();
        }
      });
    } catch(e) {}
  });
}
loadEnv();
const url = process.env.JIRA_URL;
const email = process.env.JIRA_EMAIL;
const token = process.env.JIRA_API_TOKEN;
const issueKey = process.env.DEFAULT_ISSUE_KEY || 'WEB-295';
const auth = Buffer.from(email + ':' + token).toString('base64');
fetch(url + '/rest/api/3/issue/' + issueKey, {
  headers: { 'Authorization': 'Basic ' + auth, 'Accept': 'application/json' }
}).then(r => r.json()).then(d => {
  if (d.key) {
    console.log('✅ 이슈 접근 성공!');
    console.log('이슈 키:', d.key);
    console.log('제목:', d.fields.summary);
  } else {
    console.log('❌ 오류:', JSON.stringify(d, null, 2));
  }
}).catch(e => console.error('❌ 오류:', e.message));
"
```

## 5. 작업 요약 기록하기

### 5.1 자동 기록 스크립트 사용
작업 완료 후 다음 명령어로 Jira에 코멘트를 추가합니다:

```bash
# 작업 요약 기록 (기본 이슈 키 사용)
node scripts/log-work-summary-direct.mjs

# 특정 이슈에 기록
node scripts/log-work-summary-direct.mjs --issue WEB-123
```

### 5.2 수동 기록
`temp-jira-summary.txt` 파일의 내용을 복사하여 Jira 웹사이트에서 직접 코멘트로 추가할 수 있습니다.

## 6. 문제 해결

### 6.1 404 오류 (이슈를 찾을 수 없음)
- 이슈 키가 올바른지 확인
- 이슈가 실제로 존재하는지 Jira 웹사이트에서 확인
- API 토큰에 해당 이슈에 대한 읽기/쓰기 권한이 있는지 확인

### 6.2 401 오류 (인증 실패)
- API 토큰이 올바른지 확인
- 이메일 주소가 정확한지 확인
- API 토큰이 만료되지 않았는지 확인

### 6.3 403 오류 (권한 없음)
- API 토큰에 해당 프로젝트/이슈에 대한 권한이 있는지 확인
- Jira 관리자에게 권한 요청

## 7. 보안 주의사항

⚠️ **중요**: 
- `.env.local` 파일은 절대 Git에 커밋하지 마세요 (`.gitignore`에 포함됨)
- API 토큰을 공개 저장소에 올리지 마세요
- API 토큰을 다른 사람과 공유하지 마세요

## 8. 참고 파일

- 환경 변수: `.env.local`
- Jira 로깅 스크립트: `scripts/log-work-summary-direct.mjs`
- Jira 로거 스크립트: `scripts/jira-logger.js`
- 작업 요약 템플릿: `temp-jira-summary.txt`
