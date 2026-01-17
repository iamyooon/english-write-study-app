#!/usr/bin/env node

/**
 * Auto Log Conversation to Jira
 * Cursor 대화 내용을 자동으로 Jira에 기록하는 스크립트
 * 
 * 사용법:
 *   node scripts/auto-log-conversation.js "사용자 요청" "AI 응답"
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// .env 파일 로드
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

loadEnvFile();

const JIRA_URL = process.env.JIRA_URL || '';
const JIRA_EMAIL = process.env.JIRA_EMAIL || '';
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN || '';
const DEFAULT_ISSUE_KEY = process.env.DEFAULT_ISSUE_KEY || 'WEB-294';

// Jira API 호출
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

// 대화 내용을 Jira 문서 형식으로 변환
function formatConversationToJiraDoc(userRequest, aiResponse) {
  const timestamp = new Date().toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const content = [
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: `대화 기록 - ${timestamp}` }]
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: '' }]
    },
    {
      type: 'heading',
      attrs: { level: 4 },
      content: [{ type: 'text', text: '👤 사용자 요청' }]
    },
    {
      type: 'codeBlock',
      attrs: { language: 'plain' },
      content: [
        {
          type: 'text',
          text: userRequest
        }
      ]
    },
    {
      type: 'paragraph',
      content: [{ type: 'text', text: '' }]
    },
    {
      type: 'heading',
      attrs: { level: 4 },
      content: [{ type: 'text', text: '🤖 AI 응답' }]
    }
  ];

  // AI 응답을 여러 줄로 분할
  const aiLines = aiResponse.split('\n');
  aiLines.forEach(line => {
    if (line.trim()) {
      content.push({
        type: 'paragraph',
        content: [{ type: 'text', text: line }]
      });
    }
  });

  return {
    type: 'doc',
    version: 1,
    content
  };
}

// 이슈에 코멘트 추가
async function addConversationToIssue(issueKey, userRequest, aiResponse) {
  const comment = formatConversationToJiraDoc(userRequest, aiResponse);
  
  const result = await callJiraAPI(`/issue/${issueKey}/comment`, 'POST', {
    body: comment
  });

  return result;
}

// 메인 함수
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('사용법: node scripts/auto-log-conversation.js "사용자 요청" "AI 응답"');
    process.exit(1);
  }

  const userRequest = args[0];
  const aiResponse = args.slice(1).join(' ');

  try {
    const result = await addConversationToIssue(DEFAULT_ISSUE_KEY, userRequest, aiResponse);
    console.log(`✅ 대화가 기록되었습니다: ${DEFAULT_ISSUE_KEY}`);
    console.log(`   코멘트 ID: ${result.id}`);
    return result;
  } catch (error) {
    console.error(`❌ 오류: ${error.message}`);
    process.exit(1);
  }
}

// 실행
main();

