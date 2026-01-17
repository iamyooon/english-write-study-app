#!/usr/bin/env node

/**
 * Update Jira Task
 * 이슈 담당자 및 상태 업데이트
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
    
    // 빈 응답 처리
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // JSON이 아닌 경우 (빈 응답 등)
      if (response.ok) {
        return {}; // 성공했지만 응답이 없는 경우
      }
      const text = await response.text();
      throw new Error(`Jira API 오류: HTTP ${response.status} ${response.statusText} - ${text}`);
    }
    
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

// 사용자 정보 가져오기
async function getUserInfo(email) {
  try {
    // 현재 사용자 정보 확인 (myself)
    const myself = await callJiraAPI('/myself');
    
    // 이메일이 일치하면 현재 사용자 반환
    if (myself.emailAddress === email || email.includes('seokhoon.yoon')) {
      return myself;
    }
    
    // 다른 사용자 검색 시도
    try {
      const response = await fetch(`${JIRA_URL.replace(/\/$/, '')}/rest/api/3/user/search?query=${encodeURIComponent(email)}`, {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64')}`,
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const users = await response.json();
        if (users && users.length > 0) {
          return users[0];
        }
      }
    } catch (searchError) {
      // 검색 실패 시 현재 사용자 사용
      console.log(`⚠️  사용자 검색 실패, 현재 사용자 사용: ${myself.emailAddress}`);
      return myself;
    }
    
    // 기본값: 현재 사용자
    return myself;
  } catch (error) {
    // 오류 발생 시 현재 사용자 정보 가져오기
    const myself = await callJiraAPI('/myself');
    return myself;
  }
}

// 이슈 담당자 변경
async function updateAssignee(issueKey, accountId) {
  try {
    const result = await callJiraAPI(`/issue/${issueKey}/assignee`, 'PUT', {
      accountId: accountId
    });
    return result;
  } catch (error) {
    // 빈 응답이어도 성공으로 간주 (담당자 업데이트는 빈 응답을 반환할 수 있음)
    if (error.message.includes('Unexpected end of JSON')) {
      return { success: true };
    }
    throw error;
  }
}

// 이슈 상태 변경
async function updateStatus(issueKey, statusName) {
  // 먼저 가능한 transition 목록 가져오기
  const transitions = await callJiraAPI(`/issue/${issueKey}/transitions`);
  
  // 상태 이름으로 transition 찾기
  const transition = transitions.transitions.find(t => 
    t.name.toLowerCase() === statusName.toLowerCase() || 
    t.to.name.toLowerCase() === statusName.toLowerCase()
  );
  
  if (!transition) {
    // 가능한 상태 목록 출력
    const availableStatuses = transitions.transitions.map(t => t.name || t.to.name).join(', ');
    throw new Error(`상태를 찾을 수 없습니다: ${statusName}\n가능한 상태: ${availableStatuses}`);
  }
  
  // 상태 변경
  const result = await callJiraAPI(`/issue/${issueKey}/transitions`, 'POST', {
    transition: {
      id: transition.id
    }
  });
  
  return result;
}

// 메인 함수
async function main() {
  const issueKey = process.argv[2] || 'WEB-295';
  const assigneeEmail = process.argv[3] || 'seokhoon.yoon@wewakecorp.com';
  const statusName = process.argv[4] || 'In Progress';
  
  try {
    console.log(`🔍 이슈 확인 중: ${issueKey}...`);
    const issue = await callJiraAPI(`/issue/${issueKey}`);
    console.log(`✅ 이슈 확인: ${issue.key} - ${issue.fields.summary}\n`);
    
    // 담당자 변경
    console.log(`👤 담당자 변경 중: ${assigneeEmail}...`);
    const user = await getUserInfo(assigneeEmail);
    await updateAssignee(issueKey, user.accountId);
    console.log(`✅ 담당자 변경 완료: ${user.displayName} (${user.emailAddress})\n`);
    
    // 상태 변경
    console.log(`📊 상태 변경 중: ${statusName}...`);
    await updateStatus(issueKey, statusName);
    console.log(`✅ 상태 변경 완료: ${statusName}\n`);
    
    // 최종 확인
    const updatedIssue = await callJiraAPI(`/issue/${issueKey}`);
    console.log(`✅ 업데이트 완료:`);
    console.log(`   이슈: ${updatedIssue.key}`);
    console.log(`   담당자: ${updatedIssue.fields.assignee?.displayName || '없음'}`);
    console.log(`   상태: ${updatedIssue.fields.status.name}`);
    console.log(`   URL: ${JIRA_URL}/browse/${issueKey}`);
    
  } catch (error) {
    console.error(`❌ 오류: ${error.message}`);
    process.exit(1);
  }
}

// 실행
main();

