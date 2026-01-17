// 깨진 Jira 코멘트를 올바른 형식으로 다시 작성하는 스크립트
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
const ISSUE_KEY = process.env.DEFAULT_ISSUE_KEY || 'WEB-295';

const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
const timestamp = new Date().toLocaleString('ko-KR', { 
  year: 'numeric', 
  month: '2-digit', 
  day: '2-digit', 
  hour: '2-digit', 
  minute: '2-digit', 
  second: '2-digit',
  hour12: true 
});

// 올바른 형식의 코멘트 작성
const commentBody = {
  type: 'doc',
  version: 1,
  content: [
    {
      type: 'heading',
      attrs: { level: 3 },
      content: [{ type: 'text', text: `대화 기록 - ${timestamp}` }]
    },
    { type: 'paragraph', content: [] },
    {
      type: 'heading',
      attrs: { level: 4 },
      content: [{ type: 'text', text: '👤 사용자 요청' }]
    },
    {
      type: 'codeBlock',
      attrs: { language: 'plain' },
      content: [{ 
        type: 'text', 
        text: '영어일기쓰기앱을 영어문장 쓰기앱으로 바꾸자. 앱이 수준에 맞는 적절한 한글문장을 주면 유저는 영어로 작성을 하고 ai의 도움을 받아서 작성된 문장을 평가하고 틀린 부분을 체크해주는거지. 수준은 초등학교,중학교,고등학교를 유저가 선택할 수 있게 하자.' 
      }]
    },
    { type: 'paragraph', content: [] },
    {
      type: 'heading',
      attrs: { level: 4 },
      content: [{ type: 'text', text: '🤖 AI 응답' }]
    },
    {
      type: 'paragraph',
      content: [{ 
        type: 'text', 
        text: '영어 일기 쓰기 앱을 영어 문장 쓰기 앱으로 변환 완료:' 
      }]
    },
    { type: 'paragraph', content: [] },
    {
      type: 'paragraph',
      content: [{ 
        type: 'text', 
        marks: [{ type: 'strong' }],
        text: '주요 변경사항:' 
      }]
    },
    { type: 'paragraph', content: [] },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: '1. ' },
        { type: 'text', marks: [{ type: 'strong' }], text: 'SentenceService.ts' },
        { type: 'text', text: ' 생성: 한글 문장 생성 및 영어 문장 평가 기능 구현' }
      ]
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: '수준별(초등/중등/고등) 한글 문장 생성' }]
          }]
        },
        {
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: '사용자 작성 영어 문장 평가 및 피드백 제공' }]
          }]
        }
      ]
    },
    { type: 'paragraph', content: [] },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: '2. ' },
        { type: 'text', marks: [{ type: 'strong' }], text: 'SentenceWritingPage.tsx' },
        { type: 'text', text: ' 생성: 새로운 UI 컴포넌트' }
      ]
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: '수준 선택 기능 (초등학교/중학교/고등학교)' }]
          }]
        },
        {
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: '한글 문장 생성 버튼' }]
          }]
        },
        {
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: '영어 문장 입력 영역' }]
          }]
        },
        {
          type: 'listItem',
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: 'AI 평가 결과 표시 (점수, 정답 문장, 피드백, 오류 목록)' }]
          }]
        }
      ]
    },
    { type: 'paragraph', content: [] },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: '3. ' },
        { type: 'text', marks: [{ type: 'strong' }], text: 'index.html' },
        { type: 'text', text: ' 제목 변경: ' },
        { type: 'text', marks: [{ type: 'code' }], text: "'영어 일기 쓰기'" },
        { type: 'text', text: ' → ' },
        { type: 'text', marks: [{ type: 'code' }], text: "'영어 문장 쓰기'" }
      ]
    },
    { type: 'paragraph', content: [] },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: '4. ' },
        { type: 'text', marks: [{ type: 'strong' }], text: 'main.tsx' },
        { type: 'text', text: ' 업데이트: ' },
        { type: 'text', marks: [{ type: 'code' }], text: 'DiaryPage' },
        { type: 'text', text: ' → ' },
        { type: 'text', marks: [{ type: 'code' }], text: 'SentenceWritingPage' },
        { type: 'text', text: '로 변경' }
      ]
    },
    { type: 'paragraph', content: [] },
    {
      type: 'paragraph',
      content: [{ 
        type: 'text', 
        text: '모든 변경사항을 커밋하고 GitHub에 푸시 완료.' 
      }]
    }
  ]
};

const comment = {
  body: commentBody
};

try {
  const url = `${JIRA_URL}/rest/api/3/issue/${ISSUE_KEY}/comment`;
  
  // UTF-8로 명시적으로 인코딩
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Accept': 'application/json',
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify(comment, null, 2)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ 오류: ${response.status} ${response.statusText}`);
    console.error(`응답: ${errorText}`);
    process.exit(1);
  }
  
  const data = await response.json();
  console.log(`✅ 올바른 형식으로 코멘트 작성 완료: ${ISSUE_KEY}`);
  console.log(`   코멘트 ID: ${data.id}`);
  console.log(`   코멘트 URL: ${JIRA_URL}/browse/${ISSUE_KEY}?focusedCommentId=${data.id}`);
  
} catch (error) {
  console.error(`❌ 오류: ${error.message}`);
  if (error.stack) {
    console.error(error.stack);
  }
  process.exit(1);
}

