#!/usr/bin/env node

/**
 * Create Development Task under Epic
 * WEB-287 에픽 하위에 개발 태스크 생성
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
const JIRA_PROJECT_KEY = process.env.JIRA_PROJECT_KEY || 'WEB';
const EPIC_KEY = 'WEB-287';

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

// 에픽 정보 확인
async function getEpicInfo(epicKey) {
  try {
    const epic = await callJiraAPI(`/issue/${epicKey}`);
    return epic;
  } catch (error) {
    throw new Error(`에픽 정보를 가져올 수 없습니다: ${error.message}`);
  }
}

// 하위 태스크 생성
async function createSubTask(epicKey, summary, description = '') {
  // 에픽 정보 먼저 확인
  const epic = await getEpicInfo(epicKey);
  
  const issue = {
    fields: {
      project: {
        key: JIRA_PROJECT_KEY
      },
      parent: {
        key: epicKey
      },
      summary: summary,
      description: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: description || '개발 과정을 기록하는 태스크입니다.'
              }
            ]
          }
        ]
      },
      issuetype: {
        name: 'Task'
      }
    }
  };

  const result = await callJiraAPI('/issue', 'POST', issue);
  return result;
}

// .env 파일에 태스크 키 업데이트
function updateEnvFile(taskKey) {
  const envPath = join(process.cwd(), '.env');
  let envContent = '';
  
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  }
  
  // DEFAULT_ISSUE_KEY 업데이트 또는 추가
  const lines = envContent.split('\n');
  let found = false;
  const newLines = lines.map(line => {
    if (line.trim().startsWith('DEFAULT_ISSUE_KEY=')) {
      found = true;
      return `DEFAULT_ISSUE_KEY=${taskKey}`;
    }
    return line;
  });
  
  if (!found) {
    newLines.push(`DEFAULT_ISSUE_KEY=${taskKey}`);
  }
  
  fs.writeFileSync(envPath, newLines.join('\n'), 'utf-8');
}

// 메인 함수
async function main() {
  try {
    console.log(`🔍 에픽 확인 중: ${EPIC_KEY}...`);
    const epic = await getEpicInfo(EPIC_KEY);
    console.log(`✅ 에픽 확인: ${epic.key} - ${epic.fields.summary}\n`);
    
    console.log(`📝 하위 태스크 생성 중: "개발"...`);
    const task = await createSubTask(
      EPIC_KEY,
      '개발',
      '개발 과정을 기록하는 태스크입니다. 모든 개발 작업 내용이 여기에 기록됩니다.'
    );
    
    console.log(`✅ 태스크 생성 완료: ${task.key}`);
    console.log(`   제목: 개발`);
    console.log(`   URL: ${JIRA_URL}/browse/${task.key}\n`);
    
    // .env 파일 업데이트
    updateEnvFile(task.key);
    console.log(`✅ .env 파일 업데이트 완료: DEFAULT_ISSUE_KEY=${task.key}`);
    console.log(`\n이제부터 모든 개발 과정이 ${task.key}에 기록됩니다.`);
    
  } catch (error) {
    console.error(`❌ 오류: ${error.message}`);
    process.exit(1);
  }
}

// 실행
main();

