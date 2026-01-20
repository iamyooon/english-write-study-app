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

// Windows PowerShell에서 깨진 한글 복구 함수
function fixKoreanEncoding(text) {
  if (!text || typeof text !== 'string') return text;
  
  // 이미 올바른 UTF-8인지 확인
  try {
    // 한글이 포함되어 있는지 확인
    if (/[가-힣]/.test(text)) {
      return text; // 이미 올바른 한글
    }
    
    // 깨진 한글 패턴 감지 (예: ?뜻팁???쒓?)
    if (text.includes('?') && text.length > 0) {
      // Windows CP949로 인코딩된 것을 UTF-8로 변환 시도
      try {
        // Buffer를 사용하여 인코딩 복구 시도
        // PowerShell에서 전달된 문자열이 이미 깨진 경우 복구 불가능
        // 대신 stdin이나 파일에서 읽도록 권장
        console.warn('⚠️  한글 인코딩 문제가 감지되었습니다. 파일로 저장하여 전송하는 것을 권장합니다.');
        console.warn('   예: echo "내용" > temp.txt && node scripts/log-to-jira.mjs @temp.txt --issue WEB-295');
      } catch (e) {
        // 복구 실패
      }
    }
    
    return text;
  } catch (e) {
    return text;
  }
}

// process.argv에서 인자를 가져올 때 인코딩 복구 시도
function getArgvArgs() {
  const args = [];
  for (let i = 2; i < process.argv.length; i++) {
    const arg = process.argv[i];
    // Windows에서 깨진 인코딩 복구 시도
    try {
      // Buffer를 통해 재인코딩 시도
      const buffer = Buffer.from(arg, 'latin1');
      const utf8Arg = buffer.toString('utf-8');
      args.push(utf8Arg);
    } catch (e) {
      args.push(arg);
    }
  }
  return args;
}

const argvArgs = getArgvArgs();
let userRequest = argvArgs[0] || '';
let aiResponse = argvArgs.slice(1).join(' ') || '';

// --issue 옵션 처리
let issueKey = ISSUE_KEY;
const issueIndex = argvArgs.indexOf('--issue');
if (issueIndex !== -1 && argvArgs[issueIndex + 1]) {
  issueKey = argvArgs[issueIndex + 1];
  // issue 옵션과 그 값을 제거
  const filteredArgs = argvArgs.filter((arg, idx) => {
    return idx !== issueIndex && idx !== issueIndex + 1;
  });
  if (filteredArgs.length > 0) {
    userRequest = filteredArgs[0] || '';
    aiResponse = filteredArgs.slice(1).join(' ') || '';
  } else {
    userRequest = '';
    aiResponse = '';
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
if (!userRequest && argvArgs.length > 0) {
  const args = argvArgs.filter(arg => !arg.startsWith('--') && arg !== issueKey);
  if (args.length > 0) {
    userRequest = args.join(' ');
  }
}

if (!userRequest) {
  console.error('Usage: node scripts/log-to-jira.mjs "작업 요약" [--issue ISSUE_KEY]');
  console.error('   or: node scripts/log-to-jira.mjs "user request" "ai response"');
  console.error('   or: node scripts/log-to-jira.mjs @request.txt @response.txt');
  console.error('');
  console.error('⚠️  PowerShell에서 한글 인코딩 문제가 있는 경우:');
  console.error('   1. 파일로 저장: $content = "내용"; $content | Out-File -FilePath temp.txt -Encoding UTF8; node scripts/log-to-jira.mjs @temp.txt --issue WEB-295');
  console.error('   2. PowerShell 래퍼 사용: .\\scripts\\log-to-jira-utf8.ps1 "내용" --issue WEB-295');
  console.error('   3. 코드 페이지 변경: chcp 65001; node scripts/log-to-jira.mjs "내용" --issue WEB-295');
  process.exit(1);
}

// 단일 인자만 있는 경우 작업 요약으로 처리
if (!aiResponse && userRequest) {
  aiResponse = userRequest;
  userRequest = '';
}

// 코멘트 전송 함수
async function sendComment() {

const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });

// 한글 텍스트를 안전하게 처리하기 위해 UTF-8 인코딩 확인
function ensureUtf8(text) {
  if (typeof text !== 'string') return text;
  
  // 이미 올바른 UTF-8인지 확인
  try {
    // 한글이 정상적으로 포함되어 있는지 확인
    if (/[가-힣]/.test(text)) {
      return text; // 이미 올바른 한글
    }
    
    // 깨진 한글 패턴이 있는 경우 복구 시도
    // Windows PowerShell에서 CP949로 인코딩된 것을 UTF-8로 잘못 해석한 경우
    // 이 경우 복구가 어려우므로 원본을 그대로 반환
    // (실제로는 PowerShell에서 UTF-8로 실행해야 함)
    
    return text;
  } catch (e) {
    return text;
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
}

// 코멘트 전송 실행
sendComment();

