/**
 * 작업 완료 요약을 Jira에 기록하는 스크립트
 * UTF-8 BOM 제거 및 인코딩 문제 해결
 */

import { readFileSync, writeFileSync } from 'fs';
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

// UTF-8 BOM 제거 함수
function removeBOM(text) {
  if (text.charCodeAt(0) === 0xFEFF) {
    return text.slice(1);
  }
  return text;
}

// 마크다운을 Jira Document Format으로 변환
function formatToJiraDoc(text) {
  // BOM 제거
  text = removeBOM(text);
  
  const lines = text.split('\n');
  const content = [];
  let currentListItems = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    
    if (!trimmed) {
      if (currentListItems.length > 0) {
        content.push({
          type: 'bulletList',
          content: currentListItems
        });
        currentListItems = [];
      }
      content.push({ type: 'paragraph', content: [{ type: 'text', text: '' }] });
      continue;
    }
    
    if (trimmed.startsWith('### ')) {
      if (currentListItems.length > 0) {
        content.push({
          type: 'bulletList',
          content: currentListItems
        });
        currentListItems = [];
      }
      const headingText = trimmed.substring(4).trim();
      content.push({
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: headingText }]
      });
    } else if (trimmed.startsWith('## ')) {
      if (currentListItems.length > 0) {
        content.push({
          type: 'bulletList',
          content: currentListItems
        });
        currentListItems = [];
      }
      const headingText = trimmed.substring(3).trim();
      content.push({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: headingText }]
      });
    } else if (trimmed.startsWith('# ')) {
      if (currentListItems.length > 0) {
        content.push({
          type: 'bulletList',
          content: currentListItems
        });
        currentListItems = [];
      }
      const headingText = trimmed.substring(2).trim();
      content.push({
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: headingText }]
      });
    } else if (trimmed.startsWith('- ')) {
      const text = trimmed.substring(2).trim();
      currentListItems.push({
        type: 'listItem',
        content: [{
          type: 'paragraph',
          content: [{ type: 'text', text: text }]
        }]
      });
    } else {
      if (currentListItems.length > 0) {
        content.push({
          type: 'bulletList',
          content: currentListItems
        });
        currentListItems = [];
      }
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: trimmed }]
      });
    }
  }
  
  if (currentListItems.length > 0) {
    content.push({
      type: 'bulletList',
      content: currentListItems
    });
  }
  
  return {
    type: 'doc',
    version: 1,
    content: content.length > 0 ? content : [{
      type: 'paragraph',
      content: [{ type: 'text', text: text }]
    }]
  };
}

async function callJiraAPI(endpoint, method = 'GET', body = null) {
  if (!JIRA_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
    throw new Error('Jira 설정이 완료되지 않았습니다.');
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

  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.errorMessages?.join(', ') || data.message || `HTTP ${response.status}`);
  }
  
  return data;
}

async function addComment(issueKey, content) {
  const commentBody = formatToJiraDoc(content);
  
  const result = await callJiraAPI(`/issue/${issueKey}/comment`, 'POST', {
    body: commentBody
  });

  console.log(`✅ 작업 요약 기록 완료: ${issueKey}`);
  console.log(`   코멘트 ID: ${result.id}`);
  return result;
}

// 명령줄 인자 처리
let issueKey = 'WEB-295';
let summary = '';

for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--issue' || process.argv[i] === '-i') {
    issueKey = process.argv[++i];
  } else if (process.argv[i] === '--file' || process.argv[i] === '-f') {
    const filePath = process.argv[++i];
    const fileContent = readFileSync(join(process.cwd(), filePath), 'utf-8');
    summary = removeBOM(fileContent).trim();
  } else if (!process.argv[i].startsWith('--')) {
    summary = process.argv[i];
  }
}

if (summary.startsWith('@')) {
  const filePath = summary.substring(1);
  const fileContent = readFileSync(join(process.cwd(), filePath), 'utf-8');
  summary = removeBOM(fileContent).trim();
}

if (!summary) {
  console.error('Usage: node scripts/log-work-summary.mjs "작업 요약" --issue WEB-295');
  console.error('   or: node scripts/log-work-summary.mjs --file summary.txt --issue WEB-295');
  process.exit(1);
}

addComment(issueKey, summary);
