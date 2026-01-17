// Jira에 작업 완료 요약을 코멘트로 추가하는 스크립트
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
const ISSUE_KEY = process.argv.find(arg => arg.startsWith('--issue'))?.split('=')[1] 
  || process.env.DEFAULT_ISSUE_KEY 
  || 'WEB-295';

let commentText = process.argv[2] || '';

// 파일에서 읽기 지원
if (commentText.startsWith('@')) {
  const filePath = commentText.substring(1);
  commentText = readFileSync(join(process.cwd(), filePath), 'utf-8').trim();
}

if (!commentText) {
  console.error('Usage: node scripts/add-jira-comment.mjs "comment text" [--issue=WEB-295]');
  console.error('   or: node scripts/add-jira-comment.mjs @comment.md [--issue=WEB-295]');
  process.exit(1);
}

if (!JIRA_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.error('❌ Jira 환경 변수가 설정되지 않았습니다.');
  console.error('   .env 파일에 JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN을 설정해주세요.');
  process.exit(1);
}

const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

// 마크다운을 Jira 문서 형식으로 변환 (간단한 변환)
function markdownToJiraDoc(markdown) {
  const lines = markdown.split('\n');
  const content = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // 제목 처리
    if (line.startsWith('## ')) {
      content.push({
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: line.substring(3).trim() }]
      });
    } else if (line.startsWith('### ')) {
      content.push({
        type: 'heading',
        attrs: { level: 4 },
        content: [{ type: 'text', text: line.substring(4).trim() }]
      });
    } else if (line.startsWith('- ')) {
      // 리스트 아이템
      content.push({
        type: 'bulletList',
        content: [{
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: line.substring(2).replace(/\*\*/g, '').trim() }]
          }]
        }]
      });
    } else if (line.startsWith('```')) {
      // 코드 블록 시작/끝 (단순 처리)
      continue;
    } else if (line.trim() === '') {
      // 빈 줄
      content.push({
        type: 'paragraph',
        content: []
      });
    } else {
      // 일반 텍스트 (간단한 볼드 처리)
      let text = line;
      const paragraph = {
        type: 'paragraph',
        content: []
      };
      
      // 간단한 **볼드** 처리
      const parts = text.split(/\*\*/);
      parts.forEach((part, index) => {
        if (index % 2 === 0) {
          if (part.trim()) {
            paragraph.content.push({ type: 'text', text: part });
          }
        } else {
          paragraph.content.push({ type: 'text', marks: [{ type: 'strong' }], text: part });
        }
      });
      
      if (paragraph.content.length > 0) {
        content.push(paragraph);
      }
    }
  }
  
  return content;
}

const comment = {
  body: {
    type: 'doc',
    version: 1,
    content: markdownToJiraDoc(commentText)
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
    console.log(`✅ Jira 코멘트 추가 완료: ${ISSUE_KEY}`);
    console.log(`   코멘트 ID: ${data.id}`);
  } else {
    console.error(`❌ 오류: ${data.errorMessages?.join(', ') || res.statusText}`);
    console.error(JSON.stringify(data, null, 2));
    process.exit(1);
  }
} catch (error) {
  console.error(`❌ 오류: ${error.message}`);
  process.exit(1);
}
