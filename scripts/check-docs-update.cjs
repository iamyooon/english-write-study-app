#!/usr/bin/env node
/**
 * 문서 업데이트 필요성 확인 스크립트
 * 변경된 파일을 분석하여 관련 문서 업데이트가 필요한지 확인
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 변경된 파일 목록 가져오기
function getChangedFiles() {
  try {
    const output = execSync('git diff --cached --name-only --diff-filter=ACM', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    return output.trim().split('\n').filter(Boolean);
  } catch (error) {
    return [];
  }
}

// 파일 경로에서 문서 업데이트 필요성 판단
function checkDocumentationNeeds(changedFiles) {
  const needsUpdate = {
    readme: false,
    architecture: false,
    projectStructure: false,
    implementationStatus: false,
    documentationGuide: false,
    apiDocs: false
  };

  const reasons = [];

  for (const file of changedFiles) {
    // API 라우트 변경
    if (file.startsWith('app/api/')) {
      needsUpdate.readme = true;
      needsUpdate.projectStructure = true;
      needsUpdate.apiDocs = true;
      reasons.push(`API 라우트 변경: ${file} → README.md, PROJECT_STRUCTURE.md 업데이트 필요`);
    }

    // 컴포넌트 변경
    if (file.startsWith('components/') && file.endsWith('.tsx')) {
      needsUpdate.architecture = true;
      needsUpdate.projectStructure = true;
      reasons.push(`컴포넌트 변경: ${file} → ARCHITECTURE_GUIDE.md, PROJECT_STRUCTURE.md 업데이트 필요`);
    }

    // 페이지 변경
    if (file.startsWith('app/') && file.endsWith('page.tsx')) {
      needsUpdate.readme = true;
      needsUpdate.projectStructure = true;
      reasons.push(`페이지 변경: ${file} → README.md, PROJECT_STRUCTURE.md 업데이트 필요`);
    }

    // 서비스 레이어 변경
    if (file.startsWith('services/')) {
      needsUpdate.architecture = true;
      reasons.push(`서비스 변경: ${file} → ARCHITECTURE_GUIDE.md 업데이트 필요`);
    }

    // 라이브러리 변경
    if (file.startsWith('lib/')) {
      needsUpdate.architecture = true;
      reasons.push(`라이브러리 변경: ${file} → ARCHITECTURE_GUIDE.md 업데이트 필요`);
    }

    // 새로운 기능 추가 (새 파일)
    if (changedFiles.includes(file) && !fs.existsSync(file.replace(/\.tsx?$/, '.test.tsx'))) {
      needsUpdate.implementationStatus = true;
      reasons.push(`새 기능 추가 가능: ${file} → IMPLEMENTATION_STATUS.md 확인 필요`);
    }

    // 문서 파일 자체 변경
    if (file.endsWith('.md') && file.includes('docs/')) {
      needsUpdate.documentationGuide = true;
      reasons.push(`문서 변경: ${file} → docs/DOCUMENTATION_GUIDE.md 확인 필요`);
    }

    // 설정 파일 변경
    if (file.includes('config') || file.includes('setup') || file.includes('env')) {
      needsUpdate.readme = true;
      reasons.push(`설정 변경: ${file} → README.md, 관련 설정 가이드 업데이트 필요`);
    }
  }

  return { needsUpdate, reasons };
}

// 메인 실행
function main() {
  const changedFiles = getChangedFiles();
  
  if (changedFiles.length === 0) {
    console.log('✅ 변경된 파일 없음');
    return 0;
  }

  const { needsUpdate, reasons } = checkDocumentationNeeds(changedFiles);

  // 업데이트가 필요한 문서가 있는지 확인
  const hasUpdates = Object.values(needsUpdate).some(v => v);

  if (!hasUpdates) {
    console.log('✅ 문서 업데이트 필요 없음');
    return 0;
  }

  // 자동 업데이트 스크립트 실행
  console.log('\n📚 문서 자동 업데이트 시작...\n');
  
  try {
    const updateScript = require('./update-docs.cjs');
    updateScript.main();
  } catch (error) {
    console.error('⚠️  문서 자동 업데이트 중 오류 발생:', error.message);
    console.log('\n📋 수동 업데이트가 필요한 문서:');
    
    if (needsUpdate.readme) {
      console.log('  📄 README.md');
    }
    if (needsUpdate.projectStructure) {
      console.log('  📄 PROJECT_STRUCTURE.md');
    }
    if (needsUpdate.documentationGuide) {
      console.log('  📄 docs/DOCUMENTATION_GUIDE.md');
    }
  }

  return 0;
}

if (require.main === module) {
  process.exit(main());
}

module.exports = { checkDocumentationNeeds, getChangedFiles };
