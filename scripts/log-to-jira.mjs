// Jira에 대화 기록하는 간단한 스크립트
import { readFileSync, writeFileSync } from 'fs';
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
    
    // 디버깅: 원본 인자 확인
    console.log(`[DEBUG] 원본 인자 ${i-2}:`, arg);
    console.log(`[DEBUG] 인자 바이트:`, Buffer.from(arg).toString('hex'));
    
    // Windows PowerShell에서 CP949로 인코딩된 것을 UTF-8로 잘못 해석한 경우 복구 시도
    // 하지만 이미 깨진 문자열은 복구 불가능하므로, 파일로 읽는 것을 권장
    try {
      // 한글이 포함되어 있는지 확인
      if (/[가-힣]/.test(arg)) {
        // 이미 올바른 한글이 있으면 그대로 사용
        args.push(arg);
        console.log(`[DEBUG] 올바른 한글 감지`);
      } else if (arg.includes('?') && arg.length > 0) {
        // 깨진 한글 패턴 감지 - 복구 시도
        console.warn(`[WARN] 깨진 한글 패턴 감지: ${arg}`);
        console.warn(`[WARN] 파일로 저장하여 전송하는 것을 강력히 권장합니다.`);
        
        // CP949로 인코딩된 것을 UTF-8로 변환 시도 (대부분 실패)
        try {
          // 이 방법은 대부분 실패하지만 시도
          const buffer = Buffer.from(arg, 'latin1');
          const utf8Arg = buffer.toString('utf-8');
          if (/[가-힣]/.test(utf8Arg)) {
            console.log(`[DEBUG] 복구 성공`);
            args.push(utf8Arg);
          } else {
            console.warn(`[WARN] 복구 실패 - 원본 사용`);
            args.push(arg);
          }
        } catch (e) {
          args.push(arg);
        }
      } else {
        args.push(arg);
      }
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

// 파일 인코딩 자동 감지 함수
function readFileWithEncoding(filePath) {
  const fullPath = join(process.cwd(), filePath);
  const buffer = readFileSync(fullPath);
  
  // BOM 확인
  if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
    // UTF-8 BOM
    console.log('[DEBUG] UTF-8 BOM 감지');
    return buffer.slice(3).toString('utf-8');
  } else if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
    // UTF-16 LE BOM
    console.log('[DEBUG] UTF-16 LE BOM 감지');
    return buffer.slice(2).toString('utf16le');
  } else if (buffer.length >= 2 && buffer[0] === 0xFE && buffer[1] === 0xFF) {
    // UTF-16 BE BOM
    console.log('[DEBUG] UTF-16 BE BOM 감지');
    const swapped = Buffer.alloc(buffer.length - 2);
    for (let i = 2; i < buffer.length; i += 2) {
      swapped[i - 2] = buffer[i + 1];
      swapped[i - 1] = buffer[i];
    }
    return swapped.toString('utf16le');
  } else {
    // BOM이 없으면 인코딩 자동 감지
    console.log('[DEBUG] BOM 없음 - 인코딩 자동 감지');
    
    // null 바이트가 많으면 UTF-16일 가능성이 높음
    let nullByteCount = 0;
    for (let i = 0; i < Math.min(buffer.length, 100); i++) {
      if (buffer[i] === 0x00) nullByteCount++;
    }
    
    // null 바이트가 10% 이상이면 UTF-16으로 간주
    if (nullByteCount > Math.min(buffer.length, 100) * 0.1) {
      console.log('[DEBUG] null 바이트 많음 - UTF-16 LE로 읽기 시도');
      try {
        const utf16Text = buffer.toString('utf16le');
        if (/[가-힣]/.test(utf16Text)) {
          console.log('[DEBUG] UTF-16 LE로 읽기 성공');
          return utf16Text;
        }
      } catch (e) {
        console.log('[DEBUG] UTF-16 LE 읽기 실패:', e.message);
      }
    }
    
    // UTF-8로 시도
    try {
      const utf8Text = buffer.toString('utf-8');
      // 한글이 정상적으로 포함되어 있는지 확인
      if (/[가-힣]/.test(utf8Text)) {
        console.log('[DEBUG] UTF-8로 읽기 성공');
        return utf8Text;
      }
      // UTF-8로 읽었는데 한글이 없고 null 바이트가 있으면 UTF-16으로 시도
      if (nullByteCount > 0) {
        console.log('[DEBUG] UTF-8 읽기 실패 - UTF-16 LE로 재시도');
        const utf16Text = buffer.toString('utf16le');
        if (/[가-힣]/.test(utf16Text)) {
          console.log('[DEBUG] UTF-16 LE로 읽기 성공');
          return utf16Text;
        }
      }
      console.log('[DEBUG] UTF-8로 읽기 (한글 없음)');
      return utf8Text;
    } catch (e) {
      // UTF-8 실패 시 UTF-16 LE로 시도
      console.log('[DEBUG] UTF-8 읽기 실패 - UTF-16 LE로 재시도');
      return buffer.toString('utf16le');
    }
  }
}

// 파일에서 읽기 지원
if (userRequest && userRequest.startsWith('@')) {
  const filePath = userRequest.substring(1);
  userRequest = readFileWithEncoding(filePath).trim();
  console.log('[DEBUG] 파일에서 읽은 내용 (처음 100자):', userRequest.substring(0, 100));
  console.log('[DEBUG] 한글 포함 여부:', /[가-힣]/.test(userRequest));
}

if (aiResponse && aiResponse.startsWith('@')) {
  const filePath = aiResponse.substring(1);
  aiResponse = readFileWithEncoding(filePath).trim();
  console.log('[DEBUG] 파일에서 읽은 내용 (처음 100자):', aiResponse.substring(0, 100));
  console.log('[DEBUG] 한글 포함 여부:', /[가-힣]/.test(aiResponse));
  console.log('[DEBUG] 읽은 내용 바이트 (처음 20바이트):', Buffer.from(aiResponse, 'utf-8').slice(0, 20).toString('hex'));
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
  console.error('⚠️  PowerShell에서 한글 인코딩 문제 해결 방법:');
  console.error('');
  console.error('   방법 1: 파일을 직접 작성 (가장 확실한 방법)');
  console.error('     1. jira-comment.txt 파일을 생성');
  console.error('     2. UTF-8 인코딩으로 저장 (메모장: 다른 이름으로 저장 > 인코딩: UTF-8 선택)');
  console.error('     3. node scripts/log-to-jira.mjs @jira-comment.txt --issue WEB-295');
  console.error('');
  console.error('   방법 2: 헬퍼 스크립트 사용');
  console.error('     node scripts/create-comment-file.mjs');
  console.error('     (파일이 열리면 내용 작성 후 저장)');
  console.error('     node scripts/log-to-jira.mjs @jira-comment.txt --issue WEB-295');
  console.error('');
  console.error('   방법 3: PowerShell에서 UTF-8로 저장 (주의: BOM 포함)');
  console.error('     $content = "내용";');
  console.error('     $utf8NoBom = New-Object System.Text.UTF8Encoding $false');
  console.error('     [System.IO.File]::WriteAllText("$PWD\\temp.txt", $content, $utf8NoBom)');
  console.error('     node scripts/log-to-jira.mjs @temp.txt --issue WEB-295');
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
    
    // 디버깅: 전송할 JSON을 파일로 저장 (실제 데이터 확인용)
    try {
      writeFileSync('jira-comment-debug.json', commentBody, 'utf-8');
      console.log('[DEBUG] 전송할 JSON이 jira-comment-debug.json에 저장되었습니다');
      console.log('[DEBUG] 파일을 열어서 실제 전송되는 데이터를 확인하세요');
    } catch (e) {
      // 파일 저장 실패해도 계속 진행
    }
    
    // 한글 깨짐 경고
    const hasBrokenKorean = /[?].*[?]/.test(commentBody) && commentBody.includes('?');
    if (hasBrokenKorean) {
      console.warn('');
      console.warn('⚠️  경고: 한글이 깨진 것으로 보입니다!');
      console.warn('   파일을 메모장에서 UTF-8로 직접 저장하세요.');
      console.warn('   자세한 내용: scripts/README-jira-comment.md 참조');
      console.warn('');
    }
    
    // 디버깅: 전송할 JSON 확인
    console.log('[DEBUG] 전송할 코멘트 내용 (처음 200자):');
    console.log(commentBody.substring(0, 200));
    
    // UTF-8 바이트로 변환하여 인코딩 확인
    const utf8Body = Buffer.from(commentBody, 'utf-8');
    
    // 디버깅: UTF-8 바이트 확인
    console.log('[DEBUG] UTF-8 바이트 길이:', utf8Body.length);
    console.log('[DEBUG] UTF-8 바이트 (처음 40바이트):', utf8Body.slice(0, 40).toString('hex'));
    
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

