// Jira에 대화 기록하는 간단한 스크립트
import { readFileSync } from 'fs';
import { join } from 'path';

// .env 파일 로드
function loadEnv() {
  try {
    const env = readFileSync(join(process.cwd(), '.env'), 'utf-8');
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

loadEnv();

const JIRA_URL = process.env.JIRA_URL;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const ISSUE_KEY = process.env.DEFAULT_ISSUE_KEY || 'WEB-294';

const userRequest = process.argv[2] || '';
const aiResponse = process.argv.slice(3).join(' ') || '';

if (!userRequest || !aiResponse) {
  console.error('Usage: node scripts/log-to-jira.mjs "user request" "ai response"');
  process.exit(1);
}

const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
const timestamp = new Date().toLocaleString('ko-KR');

const comment = {
  body: {
    type: 'doc',
    version: 1,
    content: [
      { type: 'heading', attrs: { level: 3 }, content: [{ type: 'text', text: `대화 기록 - ${timestamp}` }] },
      { type: 'paragraph', content: [{ type: 'text', text: '' }] },
      { type: 'heading', attrs: { level: 4 }, content: [{ type: 'text', text: '👤 사용자 요청' }] },
      { type: 'codeBlock', attrs: { language: 'plain' }, content: [{ type: 'text', text: userRequest }] },
      { type: 'paragraph', content: [{ type: 'text', text: '' }] },
      { type: 'heading', attrs: { level: 4 }, content: [{ type: 'text', text: '🤖 AI 응답' }] },
      ...aiResponse.split('\n').filter(l => l.trim()).map(l => ({ type: 'paragraph', content: [{ type: 'text', text: l }] }))
    ]
  }
};

try {
  const res = await fetch(`${JIRA_URL}/rest/api/3/issue/${ISSUE_KEY}/comment`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(comment)
  });
  
  const data = await res.json();
  if (res.ok) {
    console.log(`✅ 기록 완료: ${ISSUE_KEY}`);
  } else {
    console.error(`❌ 오류: ${data.errorMessages?.join(', ') || res.statusText}`);
    process.exit(1);
  }
} catch (error) {
  console.error(`❌ 오류: ${error.message}`);
  process.exit(1);
}

