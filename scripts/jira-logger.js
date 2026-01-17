#!/usr/bin/env node

/**
 * Jira Logger Script
 * Cursor 대화 내용을 Jira에 기록하는 스크립트
 * 
 * 사용법:
 *   node scripts/jira-logger.js "대화 내용" --issue PROJ-123
 *   node scripts/jira-logger.js --file conversation.txt --issue PROJ-123
 *   node scripts/jira-logger.js "대화 내용" --create --project PROJ --type Task
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env 파일 로드 (있는 경우)
function loadEnvFile() {
  const envPath = join(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = value;
          }
        }
      }
    }
  }
}

// .env 파일 로드
loadEnvFile();

// 환경 변수에서 설정 읽기
const JIRA_URL = process.env.JIRA_URL || '';
const JIRA_EMAIL = process.env.JIRA_EMAIL || '';
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN || '';
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY || '';

// 명령줄 인자 파싱
function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    content: null,
    file: null,
    issueKey: null,
    create: false,
    project: JIRA_PROJECT_KEY,
    type: 'Task',
    summary: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--file' || arg === '-f') {
      config.file = args[++i];
    } else if (arg === '--issue' || arg === '-i') {
      config.issueKey = args[++i];
    } else if (arg === '--create' || arg === '-c') {
      config.create = true;
    } else if (arg === '--project' || arg === '-p') {
      config.project = args[++i];
    } else if (arg === '--type' || arg === '-t') {
      config.type = args[++i];
    } else if (arg === '--summary' || arg === '-s') {
      config.summary = args[++i];
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if (arg === '--test') {
      config.test = true;
    } else if (!arg.startsWith('--')) {
      // 파일이나 내용이 아닌 경우 내용으로 간주
      if (!config.content) {
        config.content = arg;
      }
    }
  }

  return config;
}

function printHelp() {
  console.log(`
Jira Logger - Cursor 대화 내용을 Jira에 기록

사용법:
  node scripts/jira-logger.js [옵션] [내용]

옵션:
  --file, -f <파일>        파일에서 대화 내용 읽기
  --issue, -i <이슈키>     기존 이슈에 코멘트 추가 (예: PROJ-123)
  --create, -c             새 이슈 생성
  --project, -p <프로젝트> 프로젝트 키 (새 이슈 생성 시 필요)
  --type,   -t <타입>        이슈 타입 (기본: Task)
  --summary, -s <제목>     이슈 제목 (새 이슈 생성 시)
  --test           Jira 연결 테스트
  --help, -h               도움말 표시

환경 변수:
  JIRA_URL              Jira 인스턴스 URL (예: https://your-domain.atlassian.net)
  JIRA_EMAIL            Jira 계정 이메일
  JIRA_API_TOKEN        Jira API 토큰
  JIRA_PROJECT_KEY      기본 프로젝트 키

예제:
  # 기존 이슈에 코멘트 추가
  node scripts/jira-logger.js "대화 내용" --issue PROJ-123

  # 파일에서 읽어서 코멘트 추가
  node scripts/jira-logger.js --file conversation.txt --issue PROJ-123

  # 새 이슈 생성
  node scripts/jira-logger.js "대화 내용" --create --project PROJ --summary "대화 제목"

  # 환경 변수 설정 후 사용
  export JIRA_URL=https://your-domain.atlassian.net
  export JIRA_EMAIL=your-email@example.com
  export JIRA_API_TOKEN=your-api-token
  node scripts/jira-logger.js "대화 내용" --issue PROJ-123
`);
}

// Jira API 호출
async function callJiraAPI(endpoint, method = 'GET', body = null) {
  if (!JIRA_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
    throw new Error('Jira 설정이 완료되지 않았습니다. 환경 변수를 확인해주세요.');
  }

  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
  const url = `${JIRA_URL.replace(/\/$/, '')}/rest/api/3${endpoint}`;

  const options = {
    method,
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data.errorMessages?.join(', ') || data.message || `HTTP ${response.status}`;
      throw new Error(`Jira API 오류: ${errorMsg}`);
    }

    return data;
  } catch (error) {
    if (error.message.includes('Jira API 오류')) {
      throw error;
    }
    throw new Error(`네트워크 오류: ${error.message}`);
  }
}

// 기존 이슈에 코멘트 추가
async function addComment(issueKey, content) {
  const comment = formatToJiraDoc(content);
  
  const result = await callJiraAPI(`/issue/${issueKey}/comment`, 'POST', {
    body: comment
  });

  console.log(`✅ 코멘트가 추가되었습니다: ${issueKey}`);
  console.log(`   코멘트 ID: ${result.id}`);
  return result;
}

// 새 이슈 생성
async function createIssue(projectKey, issueType, summary, description) {
  const issue = {
    fields: {
      project: {
        key: projectKey
      },
      summary: summary || `Cursor 대화 기록 - ${new Date().toLocaleString('ko-KR')}`,
      description: formatToJiraDoc(description),
      issuetype: {
        name: issueType
      }
    }
  };

  const result = await callJiraAPI('/issue', 'POST', issue);

  console.log(`✅ 새 이슈가 생성되었습니다: ${result.key}`);
  console.log(`   이슈 URL: ${JIRA_URL}/browse/${result.key}`);
  return result;
}

// 텍스트를 Jira 문서 형식으로 변환
function formatToJiraDoc(text) {
  // 간단한 텍스트를 Jira 문서 형식으로 변환
  const lines = text.split('\n').filter(line => line.trim());
  
  const content = lines.map(line => {
    // 제목 형식 감지 (## 또는 **)
    if (line.match(/^##\s+/)) {
      return {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: line.replace(/^##\s+/, '') }]
      };
    }
    
    // 볼드 형식 감지 (**텍스트**)
    if (line.match(/\*\*.*\*\*/)) {
      const parts = [];
      let remaining = line;
      let match;
      
      while ((match = remaining.match(/\*\*(.*?)\*\*/)) !== null) {
        if (match.index > 0) {
          parts.push({ type: 'text', text: remaining.substring(0, match.index) });
        }
        parts.push({
          type: 'text',
          marks: [{ type: 'strong' }],
          text: match[1]
        });
        remaining = remaining.substring(match.index + match[0].length);
      }
      
      if (remaining) {
        parts.push({ type: 'text', text: remaining });
      }
      
      return {
        type: 'paragraph',
        content: parts.length > 0 ? parts : [{ type: 'text', text: line }]
      };
    }
    
    // 일반 텍스트
    return {
      type: 'paragraph',
      content: [{ type: 'text', text: line }]
    };
  });

  return {
    type: 'doc',
    version: 1,
    content: content.length > 0 ? content : [{
      type: 'paragraph',
      content: [{ type: 'text', text: text }]
    }]
  };
}

// 메인 함수
async function main() {
  const config = parseArgs();

  // 설정 검증
  if (!JIRA_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
    console.error('❌ 오류: Jira 환경 변수가 설정되지 않았습니다.');
    console.error('   다음 환경 변수를 설정해주세요:');
    console.error('   - JIRA_URL');
    console.error('   - JIRA_EMAIL');
    console.error('   - JIRA_API_TOKEN');
    process.exit(1);
  }

  // 연결 테스트
  if (config.test) {
    console.log('🔍 Jira 연결 테스트 중...\n');
    try {
      const user = await callJiraAPI('/myself');
      console.log('✅ 연결 성공!');
      console.log(`   사용자: ${user.displayName}`);
      console.log(`   이메일: ${user.emailAddress}`);
      console.log(`   계정 ID: ${user.accountId}\n`);
      
      // 프로젝트 정보 확인
      if (JIRA_PROJECT_KEY) {
        try {
          const project = await callJiraAPI(`/project/${JIRA_PROJECT_KEY}`);
          console.log(`✅ 프로젝트 확인: ${project.key} - ${project.name}`);
        } catch (error) {
          console.log(`⚠️  프로젝트 확인 실패: ${error.message}`);
        }
      }
      
      process.exit(0);
    } catch (error) {
      console.error(`❌ 연결 실패: ${error.message}`);
      process.exit(1);
    }
  }

  // 내용 가져오기
  let content = config.content;
  
  if (config.file) {
    try {
      const filePath = join(process.cwd(), config.file);
      content = fs.readFileSync(filePath, 'utf-8');
    } catch (error) {
      console.error(`❌ 파일 읽기 오류: ${error.message}`);
      process.exit(1);
    }
  }

  if (!content) {
    console.error('❌ 오류: 대화 내용이 제공되지 않았습니다.');
    console.error('   --file 옵션을 사용하거나 내용을 인자로 제공해주세요.');
    printHelp();
    process.exit(1);
  }

  try {
    if (config.create) {
      // 새 이슈 생성
      if (!config.project) {
        console.error('❌ 오류: 새 이슈 생성 시 프로젝트 키가 필요합니다.');
        console.error('   --project 옵션을 사용하거나 JIRA_PROJECT_KEY 환경 변수를 설정해주세요.');
        process.exit(1);
      }

      await createIssue(
        config.project,
        config.type,
        config.summary,
        content
      );
    } else if (config.issueKey) {
      // 기존 이슈에 코멘트 추가
      await addComment(config.issueKey, content);
    } else {
      console.error('❌ 오류: --issue 또는 --create 옵션이 필요합니다.');
      printHelp();
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ 오류: ${error.message}`);
    process.exit(1);
  }
}

// 실행
main();

