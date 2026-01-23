#!/usr/bin/env node

/**
 * 문서 자동 업데이트 스크립트
 * 커밋 전에 최신 구현 상태를 문서에 반영
 */

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// 테스트 결과 가져오기 (이미 실행된 테스트 결과를 파싱)
function getTestResults() {
  try {
    // pre-commit에서 이미 테스트가 실행되었으므로, 
    // 여기서는 테스트를 다시 실행하지 않고 결과를 파싱만 시도
    // 실제로는 pre-commit.ps1에서 테스트 결과를 파일로 저장하거나
    // 다른 방법으로 전달받아야 하지만, 간단하게 테스트를 다시 실행
    const output = execSync('npm test 2>&1', {
      cwd: rootDir,
      encoding: 'utf-8',
      stdio: 'pipe',
    });
    
    // Vitest 출력에서 테스트 결과 파싱
    const lines = output.split('\n');
    let passed = 0;
    let failed = 0;
    let total = 0;
    
    // "Test Files  X passed" 패턴 찾기
    const testFilesMatch = output.match(/Test Files\s+(\d+)\s+passed/);
    const testsMatch = output.match(/Tests\s+(\d+)\s+passed/);
    const failedMatch = output.match(/Tests\s+\d+\s+passed.*?(\d+)\s+failed/);
    
    if (testsMatch) {
      passed = parseInt(testsMatch[1]) || 0;
      total = passed;
    }
    
    if (failedMatch) {
      failed = parseInt(failedMatch[1]) || 0;
      total = passed + failed;
    }
    
    if (total > 0) {
      return { numPassedTests: passed, numFailedTests: failed, numTotalTests: total };
    }
  } catch (error) {
    // 테스트 실패 시에도 계속 진행
    console.warn('테스트 결과 파싱 실패:', error.message);
  }
  return null;
}

// README.md에 테스트 결과 추가
function updateReadmeWithTestResults(testResults) {
  const readmePath = join(rootDir, 'README.md');
  let content = fs.readFileSync(readmePath, 'utf-8');
  
  // 테스트 섹션 찾기
  const testSectionIndex = content.indexOf('## 🧪 테스트');
  if (testSectionIndex === -1) return;
  
  // 테스트 섹션 끝 찾기
  const nextSectionIndex = content.indexOf('## ', testSectionIndex + 1);
  const testSectionEnd = nextSectionIndex !== -1 ? nextSectionIndex : content.length;
  
  const testSection = content.substring(testSectionIndex, testSectionEnd);
  
  // 테스트 결과 추가
  let updatedTestSection = testSection;
  
  if (testResults && testResults.numTotalTests) {
    const passed = testResults.numPassedTests || 0;
    const failed = testResults.numFailedTests || 0;
    const total = testResults.numTotalTests || 0;
    
    const testStatus = `
### 최신 테스트 결과

\`\`\`
✅ 통과: ${passed}/${total}
${failed > 0 ? `❌ 실패: ${failed}/${total}` : ''}
📅 마지막 업데이트: ${new Date().toLocaleString('ko-KR')}
\`\`\`
`;
    
    // 기존 테스트 결과 제거
    updatedTestSection = updatedTestSection.replace(/### 최신 테스트 결과[\s\S]*?```/g, '');
    
    // 테스트 결과 추가
    updatedTestSection = updatedTestSection.trim() + '\n' + testStatus;
  }
  
  content = content.substring(0, testSectionIndex) + updatedTestSection + content.substring(testSectionEnd);
  fs.writeFileSync(readmePath, content, 'utf-8');
  console.log('✅ README.md 업데이트 완료');
}

// IMPLEMENTATION_STATUS.md에 최신 날짜 추가
function updateImplementationStatus() {
  const statusPath = join(rootDir, 'IMPLEMENTATION_STATUS.md');
  let content = fs.readFileSync(statusPath, 'utf-8');
  
  // 마지막 업데이트 날짜 추가/업데이트
  const updateDate = `\n---\n\n**마지막 업데이트**: ${new Date().toLocaleString('ko-KR')}\n`;
  
  // 기존 업데이트 날짜 제거
  content = content.replace(/\n---\n\n\*\*마지막 업데이트\*\*:.*\n/g, '');
  
  // 새 업데이트 날짜 추가
  content = content.trim() + updateDate;
  
  fs.writeFileSync(statusPath, content, 'utf-8');
  console.log('✅ IMPLEMENTATION_STATUS.md 업데이트 완료');
}

// 메인 실행
function main() {
  console.log('📚 문서 업데이트 시작...');
  
  try {
    const testResults = getTestResults();
    updateReadmeWithTestResults(testResults);
    updateImplementationStatus();
    
    console.log('✅ 모든 문서 업데이트 완료!');
  } catch (error) {
    console.error('❌ 문서 업데이트 중 오류:', error.message);
    process.exit(1);
  }
}

main();
