/**
 * 작업 완료 요약을 Jira에 기록하는 스크립트 (직접 문자열 전달)
 */

import { readFileSync } from 'fs';
import { join } from 'path';

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
- 에너지 시스템 구현 완료
- Placement Test 재방문 로직 개선

### 주요 변경사항

#### 에너지 시스템
- 문장 생성 API에 에너지 체크 및 소모 로직 추가
  - 문장 생성 시 1 에너지 소모
  - 에너지 부족 시 에러 반환
  - 데이터베이스에 에너지 업데이트
- Writing 페이지에 에너지 UI 추가
  - 페이지 상단에 에너지 표시 (현재/최대: 5)
  - 에너지 바 시각화
  - 에너지 부족 시 버튼 비활성화
  - 프로필에서 에너지 정보 로드 및 실시간 업데이트

#### Placement Test 재방문 로직
- 루트 페이지에서 이미 placement_level이 있으면 Writing으로 자동 리다이렉트
- 온보딩 페이지에서도 placement_level 확인 후 리다이렉트
- Placement 페이지에서 중복 테스트 방지
- 사용자 경험 개선: 한 번 테스트 완료 후 재방문 시 바로 학습 시작 가능

### 생성/수정된 파일
- app/api/study/generate-mission/route.ts (에너지 체크 및 소모 로직 추가)
- app/writing/page.tsx (에너지 UI 추가)
- app/page.tsx (Placement Test 재방문 로직)
- app/onboarding/page.tsx (Placement Test 재방문 로직)
- app/placement/page.tsx (중복 테스트 방지)

### 데이터베이스
- 에너지는 profiles 테이블의 energy 필드에 저장 (기본값: 5)
- 문장 생성 시 1씩 감소

### 다음 단계 (미구현)
- 에너지 충전 기능 (시간 경과, 보석 사용 등)
- 일일 에너지 리셋
- 에너지 히스토리 관리`;

// 명령줄 인자 처리
let issueKey = process.env.DEFAULT_ISSUE_KEY || 'WEB-295';

for (let i = 2; i < process.argv.length; i++) {
  if (process.argv[i] === '--issue' || process.argv[i] === '-i') {
    issueKey = process.argv[++i];
  }
}

addComment(issueKey, summary);
