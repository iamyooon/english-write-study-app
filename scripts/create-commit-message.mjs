#!/usr/bin/env node
/**
 * 커밋 메시지 파일 생성 스크립트 (UTF-8 인코딩 보장)
 * 사용법: node scripts/create-commit-message.mjs "커밋 메시지 내용"
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 커밋 메시지 가져오기
const message = process.argv.slice(2).join('\n');

if (!message) {
  console.error('❌ 사용법: node scripts/create-commit-message.mjs "커밋 메시지"');
  process.exit(1);
}

const commitMessageFile = join(process.cwd(), 'commit-message.txt');

// UTF-8로 파일 작성 (BOM 없음)
fs.writeFileSync(commitMessageFile, message, 'utf-8');

console.log('✅ 커밋 메시지 파일 생성 완료: commit-message.txt');
console.log('');
console.log('다음 명령어로 커밋하세요:');
console.log('  git commit -F commit-message.txt');
console.log('');
console.log('커밋 후 파일 삭제:');
console.log('  Remove-Item commit-message.txt (PowerShell)');
console.log('  rm commit-message.txt (Bash)');
