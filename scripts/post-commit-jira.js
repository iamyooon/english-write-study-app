#!/usr/bin/env node

/**
 * Git post-commit hook - Jira 코멘트 자동 추가
 * 커밋 완료 후 자동으로 Jira에 코멘트를 남깁니다.
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

// .env 파일 로드
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
    } catch (e) {
      // 파일이 없으면 무시
    }
  }
}

loadEnv();

const JIRA_URL = process.env.JIRA_URL;
const JIRA_EMAIL = process.env.JIRA_EMAIL;
const JIRA_API_TOKEN = process.env.JIRA_API_TOKEN;
const DEFAULT_ISSUE_KEY = process.env.DEFAULT_ISSUE_KEY || process.env.JIRA_PROJECT_KEY;

// Jira 설정 확인
if (!JIRA_URL || !JIRA_EMAIL || !JIRA_API_TOKEN) {
  console.log('⚠️  Jira 설정이 없어 코멘트를 추가하지 않습니다.');
  console.log('   다음 환경 변수를 설정해주세요: JIRA_URL, JIRA_EMAIL, JIRA_API_TOKEN');
  process.exit(0); // 오류 없이 종료 (커밋은 성공)
}

// 커밋 정보 가져오기
function getCommitInfo() {
  try {
    const commitHash = execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
    const commitMessage = execSync('git log -1 --pretty=%B', { encoding: 'utf-8' }).trim();
    const commitAuthor = execSync('git log -1 --pretty=%an', { encoding: 'utf-8' }).trim();
    const commitDate = execSync('git log -1 --pretty=%ai', { encoding: 'utf-8' }).trim();
    
    // 변경된 파일 목록
    const changedFiles = execSync('git diff-tree --no-commit-id --name-only -r HEAD', { encoding: 'utf-8' })
      .trim()
      .split('\n')
      .filter(f => f.trim());
    
    // 변경 통계
    const stats = execSync('git diff-tree --no-commit-id --numstat -r HEAD', { encoding: 'utf-8' })
      .trim()
      .split('\n')
      .filter(s => s.trim())
      .map(line => {
        const [additions, deletions, file] = line.split('\t');
        return { additions: parseInt(additions) || 0, deletions: parseInt(deletions) || 0, file };
      });
    
    const totalAdditions = stats.reduce((sum, s) => sum + s.additions, 0);
    const totalDeletions = stats.reduce((sum, s) => sum + s.deletions, 0);
    
    return {
      hash: commitHash,
      message: commitMessage,
      author: commitAuthor,
      date: commitDate,
      files: changedFiles,
      stats: { additions: totalAdditions, deletions: totalDeletions }
    };
  } catch (error) {
    console.error('❌ 커밋 정보 가져오기 실패:', error.message);
    return null;
  }
}

// 커밋 메시지에서 이슈 키 추출 (예: PROJ-123, WEB-456)
function extractIssueKey(commitMessage) {
  // 일반적인 패턴: PROJ-123, WEB-456 등
  const issuePattern = /([A-Z]+-\d+)/g;
  const matches = commitMessage.match(issuePattern);
  return matches ? matches[0] : null;
}

// Jira 코멘트 생성
function createJiraComment(commitInfo) {
  const timestamp = new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' });
  
  const commentLines = [
    `커밋 완료: ${commitInfo.hash.substring(0, 7)}`,
    `작성자: ${commitInfo.author}`,
    `일시: ${timestamp}`,
    '',
    `**커밋 메시지:**`,
    commitInfo.message,
    '',
    `**변경 통계:**`,
    `+${commitInfo.stats.additions}줄 추가, -${commitInfo.stats.deletions}줄 삭제`,
    '',
    `**변경된 파일 (${commitInfo.files.length}개):**`,
    ...commitInfo.files.slice(0, 10).map(f => `- ${f}`),
    ...(commitInfo.files.length > 10 ? [`... 외 ${commitInfo.files.length - 10}개 파일`] : [])
  ];
  
  return commentLines.join('\n');
}

// Jira에 코멘트 추가
async function addJiraComment(issueKey, comment) {
  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');
  
  // Jira 문서 형식으로 변환
  const commentContent = comment.split('\n').filter(l => l.trim()).map(line => {
    // 제목 형식 감지
    if (line.match(/^\*\*.*\*\*:$/)) {
      const text = line.replace(/\*\*/g, '');
      return {
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text }]
      };
    }
    
    // 볼드 형식 감지
    if (line.match(/\*\*.*\*\*/)) {
      const parts = [];
      let remaining = line;
      let match;
      
      while ((match = remaining.match(/\*\*(.*?)\*\*/)) !== null) {
        if (match.index > 0) {
          parts.push({ type: 'text', text: remaining.substring(0, match.index) });
        }
        parts.push({
          type: 'text',
          marks: [{ type: 'strong' }],
          text: match[1]
        });
        remaining = remaining.substring(match.index + match[0].length);
      }
      
      if (remaining) {
        parts.push({ type: 'text', text: remaining });
      }
      
      return {
        type: 'paragraph',
        content: parts.length > 0 ? parts : [{ type: 'text', text: line }]
      };
    }
    
    // 일반 텍스트
    return {
      type: 'paragraph',
      content: [{ type: 'text', text: line }]
    };
  });
  
  const commentBody = {
    body: {
      type: 'doc',
      version: 1,
      content: commentContent
    }
  };
  
  try {
    const response = await fetch(`${JIRA_URL}/rest/api/3/issue/${issueKey}/comment`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json; charset=utf-8'
      },
      body: JSON.stringify(commentBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.errorMessages?.join(', ') || response.statusText);
    }
    
    const data = await response.json();
    console.log(`✅ Jira 코멘트 추가 완료: ${issueKey}`);
    return data;
  } catch (error) {
    console.error(`❌ Jira 코멘트 추가 실패: ${error.message}`);
    throw error;
  }
}

// 메인 실행
async function main() {
  try {
    const commitInfo = getCommitInfo();
    if (!commitInfo) {
      console.log('⚠️  커밋 정보를 가져올 수 없어 Jira 코멘트를 추가하지 않습니다.');
      process.exit(0);
    }
    
    // 이슈 키 찾기
    let issueKey = extractIssueKey(commitInfo.message);
    if (!issueKey && DEFAULT_ISSUE_KEY) {
      issueKey = DEFAULT_ISSUE_KEY;
      console.log(`ℹ️  커밋 메시지에서 이슈 키를 찾지 못해 기본 이슈 키 사용: ${issueKey}`);
    }
    
    if (!issueKey) {
      console.log('⚠️  이슈 키를 찾을 수 없어 Jira 코멘트를 추가하지 않습니다.');
      console.log('   커밋 메시지에 이슈 키를 포함하거나 DEFAULT_ISSUE_KEY 환경 변수를 설정해주세요.');
      process.exit(0);
    }
    
    // 코멘트 생성 및 추가
    const comment = createJiraComment(commitInfo);
    await addJiraComment(issueKey, comment);
    
  } catch (error) {
    // 오류가 발생해도 커밋은 성공한 상태이므로 경고만 출력
    console.error(`⚠️  Jira 코멘트 추가 중 오류 발생: ${error.message}`);
    console.error('   커밋은 정상적으로 완료되었습니다.');
    process.exit(0); // 오류 없이 종료
  }
}

main();
