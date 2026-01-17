/**
 * Jira 코멘트 삭제 스크립트
 */

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

async function deleteLatestComment(issueKey) {
  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

  try {
    // 먼저 코멘트 목록 가져오기
    const commentsResponse = await fetch(
      `${JIRA_URL}/rest/api/3/issue/${issueKey}/comment`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: 'application/json',
        },
      }
    );

    if (!commentsResponse.ok) {
      const errorText = await commentsResponse.text();
      throw new Error(`Failed to fetch comments: ${commentsResponse.status} ${errorText}`);
    }

    const commentsData = await commentsResponse.json();
    const comments = commentsData.comments || [];

    if (comments.length === 0) {
      console.log('❌ 삭제할 코멘트가 없습니다.');
      return;
    }

    // 가장 최근 코멘트 찾기
    const latestComment = comments[comments.length - 1];
    const commentId = latestComment.id;

    console.log(`📝 최근 코멘트 ID: ${commentId}`);
    console.log(`📝 코멘트 내용: ${latestComment.body?.content?.[0]?.content?.[0]?.text || '(비어있음)'}`);

    // 코멘트 삭제
    const deleteResponse = await fetch(
      `${JIRA_URL}/rest/api/3/issue/${issueKey}/comment/${commentId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Basic ${auth}`,
          Accept: 'application/json',
        },
      }
    );

    if (!deleteResponse.ok) {
      const errorText = await deleteResponse.text();
      throw new Error(`Failed to delete comment: ${deleteResponse.status} ${errorText}`);
    }

    console.log(`✅ 코멘트 삭제 완료: ${issueKey}`);
  } catch (error) {
    console.error('❌ 오류 발생:', error.message);
    process.exit(1);
  }
}

const issueKey = process.argv[2] || 'WEB-295';

deleteLatestComment(issueKey);
