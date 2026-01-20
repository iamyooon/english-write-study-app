#!/usr/bin/env node
/**
 * 커밋 메시지 파일 생성 및 커밋 실행 스크립트 (UTF-8 인코딩 보장)
 * Jira 코멘트 스크립트와 동일한 방식으로 파일 처리
 * 
 * 사용법:
 *   node scripts/commit-with-message.mjs "커밋 메시지 내용"
 *   node scripts/commit-with-message.mjs @commit-message.txt
 */

import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 커밋 메시지 가져오기
let message = '';
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ 사용법: node scripts/commit-with-message.mjs "커밋 메시지"');
  console.error('   또는: node scripts/commit-with-message.mjs @commit-message.txt');
  process.exit(1);
}

// 파일에서 읽기 (@filename 형식)
if (args[0].startsWith('@')) {
  const filePath = args[0].substring(1);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ 파일을 찾을 수 없습니다: ${filePath}`);
    process.exit(1);
  }
  
  // UTF-8로 파일 읽기 (BOM 자동 처리)
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  // UTF-8 BOM 제거 (있는 경우)
  message = fileContent.replace(/^\uFEFF/, '');
} else {
  // 직접 메시지 전달
  message = args.join('\n');
}

if (!message.trim()) {
  console.error('❌ 커밋 메시지가 비어있습니다.');
  process.exit(1);
}

const commitMessageFile = join(process.cwd(), 'commit-message-temp.txt');

try {
  // UTF-8로 파일 작성 (BOM 없음)
  fs.writeFileSync(commitMessageFile, message, 'utf-8');
  
  console.log('✅ 커밋 메시지 파일 생성 완료');
  console.log('');
  
  // 변경사항이 있는지 확인
  try {
    const status = execSync('git status --porcelain', {
      encoding: 'utf-8',
      cwd: process.cwd()
    }).trim();
    
    if (!status) {
      console.log('⚠️ 커밋할 변경사항이 없습니다.');
      // 임시 파일 삭제
      if (fs.existsSync(commitMessageFile)) {
        fs.unlinkSync(commitMessageFile);
      }
      process.exit(0);
    }
    
    // Git 커밋 실행
    console.log('📝 Git 커밋 실행 중...');
    execSync(`git commit -F "${commitMessageFile}"`, {
      stdio: 'inherit',
      encoding: 'utf-8',
      cwd: process.cwd()
    });
    console.log('');
    console.log('✅ 커밋 완료');
  } catch (error) {
    console.error('');
    console.error('❌ 커밋 실패:', error.message);
    console.error('');
    console.error('💡 팁: 변경사항을 먼저 스테이징하세요:');
    console.error('   git add .');
    console.error('   또는 특정 파일만: git add <파일명>');
    process.exit(1);
  } finally {
    // 임시 파일 삭제
    if (fs.existsSync(commitMessageFile)) {
      fs.unlinkSync(commitMessageFile);
    }
  }
} catch (error) {
  console.error('❌ 오류 발생:', error.message);
  // 임시 파일 정리
  if (fs.existsSync(commitMessageFile)) {
    fs.unlinkSync(commitMessageFile);
  }
  process.exit(1);
}
