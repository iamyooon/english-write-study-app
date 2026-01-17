/**
 * 작업 완료 요약을 Jira에 기록하는 스크립트 (직접 문자열 전달)
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

function formatToJiraDoc(text) {
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
      content.push({
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: trimmed.substring(4).trim() }]
      });
    } else if (trimmed.startsWith('## ')) {
      if (currentListItems.length > 0) {
        content.push({
          type: 'bulletList',
          content: currentListItems
        });
        currentListItems = [];
      }
      content.push({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: trimmed.substring(3).trim() }]
      });
    } else if (trimmed.startsWith('# ')) {
      if (currentListItems.length > 0) {
        content.push({
          type: 'bulletList',
          content: currentListItems
        });
        currentListItems = [];
      }
      content.push({
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: trimmed.substring(2).trim() }]
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

async function addComment(issueKey, content) {
  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
  const commentBody = formatToJiraDoc(content);
  
  const comment = {
    body: commentBody
  };
  
  try {
    const res = await fetch(`${JIRA_URL}/rest/api/3/issue/${issueKey}/comment`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(comment)
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`❌ 오류: ${res.status} ${res.statusText}`);
      console.error(`응답: ${errorText.substring(0, 500)}`);
      process.exit(1);
    }
    
    const data = await res.json();
    console.log(`✅ 작업 요약 기록 완료: ${issueKey}`);
    console.log(`   코멘트 ID: ${data.id}`);
  } catch (error) {
    console.error(`❌ 오류: ${error.message}`);
    process.exit(1);
  }
}

// 작업 요약 내용 (직접 문자열로 정의)
const summary = `## 작업 완료 요약

### 완료된 작업
- .cursorrules 파일에 Jira 자동 로깅 규칙 추가
- 작업 완료 시 자동으로 Jira 코멘트를 남기는 규칙 설정
- 작업 요약 전용 스크립트 생성 (log-work-summary.mjs)
- Jira 코멘트 삭제 스크립트 생성 (delete-jira-comment.mjs)
- 한글 인코딩 문제 해결 (UTF-8 BOM 제거)

### 주요 변경사항
- .cursorrules 파일에 'Jira 자동 로깅 규칙' 섹션 추가
  - 기본 이슈 키: WEB-295 (개발 태스크)
  - 작업 요약 형식 가이드 포함
  - 자동 실행 규칙 명시
- log-work-summary.mjs 스크립트 생성
  - 마크다운 형식의 작업 요약을 Jira Document Format으로 변환
  - UTF-8 BOM 자동 제거 기능 추가
  - 헤딩, 리스트, 볼드 텍스트 지원
- delete-jira-comment.mjs 스크립트 생성
  - 최근 코멘트 자동 삭제 기능
  - 코멘트 ID 및 내용 확인 기능

### 생성/수정된 파일
- .cursorrules (Jira 자동 로깅 규칙 추가)
- scripts/log-work-summary.mjs (작업 요약 전용 스크립트)
- scripts/delete-jira-comment.mjs (코멘트 삭제 스크립트)
- scripts/test-jira-encoding.mjs (인코딩 테스트 스크립트)

### 해결된 문제
- 한글 인코딩 문제 해결 (UTF-8 BOM 제거)
- Jira Document Format 변환 로직 개선
- 리스트 아이템 연속 처리 개선`;

// 명령줄 인자 처리
let issueKey = 'WEB-295';

for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--issue' || process.argv[i] === '-i') {
    issueKey = process.argv[++i];
  }
}

addComment(issueKey, summary);
