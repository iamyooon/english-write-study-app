// Jira에 대화 기록하는 간단한 스크립트
import { readFileSync } from 'fs';
import { join } from 'path';

// .env.local과 .env 파일 로드 (.env.local이 우선순위 높음)
function loadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    try {
      const env = readFileSync(join(process.cwd(), file), 'utf-8');
      for (const line of env.split('\n')) {
        const [key, ...vals] = line.split('=');
        if (key && vals.length) {
          const val = vals.join('=').trim();
          if (!process.env[key.trim()]) {
            process.env[key.trim()] = val;
          }
        }
      }
    } catch (e) {}
  }
}

loadEnv();

const JIRA_URL = process.env.JIRA_URL;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const ISSUE_KEY = process.env.DEFAULT_ISSUE_KEY || process.env.JIRA_PROJECT_KEY || 'WEB-295';

// PowerShell에서 한글 인코딩 문제 해결을 위해 명시적으로 처리
process.stdin.setEncoding('utf-8');
if (process.stdout.isTTY) {
  process.stdout.setDefaultEncoding('utf-8');
}

let userRequest = process.argv[2] || '';
let aiResponse = process.argv.slice(3).join(' ') || '';

// --issue 옵션 처리
let issueKey = ISSUE_KEY;
const issueIndex = process.argv.indexOf('--issue');
if (issueIndex !== -1 && process.argv[issueIndex + 1]) {
  issueKey = process.argv[issueIndex + 1];
  // issue 옵션과 그 값을 제거
  const args = process.argv.slice(2);
  const issueIdx = args.indexOf('--issue');
  if (issueIdx !== -1) {
    args.splice(issueIdx, 2);
    if (args.length > 0) {
      userRequest = args[0] || '';
      aiResponse = args.slice(1).join(' ') || '';
    }
  }
}

// 파일에서 읽기 지원
if (userRequest && userRequest.startsWith('@')) {
  const filePath = userRequest.substring(1);
  userRequest = readFileSync(join(process.cwd(), filePath), 'utf-8').trim();
}

if (aiResponse && aiResponse.startsWith('@')) {
  const filePath = aiResponse.substring(1);
  aiResponse = readFileSync(join(process.cwd(), filePath), 'utf-8').trim();
}

// 단일 인자로 작업 요약을 받는 경우 (--issue 옵션 사용 시)
if (!userRequest && process.argv.length > 2) {
  const args = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
  if (args.length > 0) {
    userRequest = args.join(' ');
  }
}

if (!userRequest) {
  console.error('Usage: node scripts/log-to-jira.mjs "작업 요약" [--issue ISSUE_KEY]');
  console.error('   or: node scripts/log-to-jira.mjs "user request" "ai response"');
  console.error('   or: node scripts/log-to-jira.mjs @request.txt @response.txt');
  process.exit(1);
}

// 단일 인자만 있는 경우 작업 요약으로 처리
if (!aiResponse && userRequest) {
  aiResponse = userRequest;
  userRequest = '';
}

const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

// 한글 텍스트를 안전하게 처리하기 위해 UTF-8 인코딩 확인
function ensureUtf8(text) {
  if (typeof text !== 'string') return text;
  // 이미 UTF-8인 경우 그대로 반환
  try {
    Buffer.from(text, 'utf-8').toString('utf-8');
    return text;
  } catch (e) {
    // 인코딩 문제가 있는 경우 재인코딩
    return Buffer.from(text, 'latin1').toString('utf-8');
  }
}

// 코멘트 내용 구성
let commentContent = [];

if (userRequest && aiResponse) {
  // 대화 기록 형식
  commentContent = [
    { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: ensureUtf8(`대화 기록 - ${timestamp}`) }] },
    { type: 'paragraph', content: [{ type: 'text', text: '' }] },
    { type: 'heading', attrs: { level: 4 }, content: [{ type: 'text', text: ensureUtf8('👤 사용자 요청') }] },
    { type: 'codeBlock', attrs: { language: 'plain' }, content: [{ type: 'text', text: ensureUtf8(userRequest) }] },
    { type: 'paragraph', content: [{ type: 'text', text: '' }] },
    { type: 'heading', attrs: { level: 4 }, content: [{ type: 'text', text: ensureUtf8('🤖 AI 응답') }] },
    ...ensureUtf8(aiResponse).split('\n').filter(l => l.trim()).map(l => ({ 
      type: 'paragraph', 
      content: [{ type: 'text', text: ensureUtf8(l) }] 
    }))
  ];
} else {
  // 작업 요약 형식 (단일 인자)
  commentContent = ensureUtf8(aiResponse || userRequest).split('\n').filter(l => l.trim()).map(l => ({
    type: 'paragraph',
    content: [{ type: 'text', text: ensureUtf8(l) }]
  }));
}

const comment = {
  body: {
    type: 'doc',
    version: 1,
    content: commentContent
  }
};

try {
  // UTF-8 인코딩을 명시적으로 처리
  const commentBody = JSON.stringify(comment, null, 2);
  
  // UTF-8 바이트로 변환하여 인코딩 확인
  const utf8Body = Buffer.from(commentBody, 'utf-8');
  
  const res = await fetch(`${JIRA_URL}/rest/api/3/issue/${issueKey}/comment`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: utf8Body
  });
  
  const data = await res.json();
  if (res.ok) {
    console.log(`✅ 기록 완료: ${issueKey}`);
  } else {
    console.error(`❌ 오류: ${data.errorMessages?.join(', ') || res.statusText}`);
    if (data.errors) {
      console.error(`   상세: ${JSON.stringify(data.errors, null, 2)}`);
    }
    process.exit(1);
  }
} catch (error) {
  console.error(`❌ 오류: ${error.message}`);
  if (error.stack) {
    console.error(`   스택: ${error.stack}`);
  }
  process.exit(1);
}

