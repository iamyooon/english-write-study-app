/**
 * Jira 한글 인코딩 테스트 스크립트
 */

import { readFileSync } from 'fs';
import { join } from 'path';

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

const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

// 간단한 한글 테스트
const testComment = {
  body: {
    type: 'doc',
    version: 1,
    content: [
      {
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: '작업 완료 요약' }]
      },
      {
        type: 'paragraph',
        content: [{ type: 'text', text: '테스트 한글 텍스트입니다.' }]
      },
      {
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: '완료된 작업 항목 1' }]
            }]
          },
          {
            type: 'listItem',
            content: [{
              type: 'paragraph',
              content: [{ type: 'text', text: '완료된 작업 항목 2' }]
            }]
          }
        ]
      }
    ]
  }
};

console.log('전송할 JSON:');
console.log(JSON.stringify(testComment, null, 2));
console.log('\n한글 텍스트 확인:');
console.log('  - "작업 완료 요약":', testComment.body.content[0].content[0].text);
console.log('  - "테스트 한글 텍스트입니다.":', testComment.body.content[1].content[0].text);
console.log('\n');

try {
  const res = await fetch(`${JIRA_URL}/rest/api/3/issue/WEB-295/comment`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(testComment)
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error(`❌ 오류: ${res.status} ${res.statusText}`);
    console.error(`응답: ${errorText}`);
    process.exit(1);
  }
  
  const data = await res.json();
  console.log(`✅ 테스트 코멘트 추가 완료: WEB-295`);
  console.log(`   코멘트 ID: ${data.id}`);
  console.log(`\nJira에서 확인해보세요: ${JIRA_URL}/browse/WEB-295?focusedCommentId=${data.id}`);
} catch (error) {
  console.error(`❌ 오류: ${error.message}`);
  process.exit(1);
}
