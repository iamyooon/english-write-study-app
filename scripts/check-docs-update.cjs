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

  // 경고 메시지 출력
  console.log('\n📚 문서 업데이트 확인 결과:\n');
  console.log('⚠️  다음 문서들의 업데이트를 고려해주세요:\n');

  if (needsUpdate.readme) {
    console.log('  📄 README.md');
    console.log('     - 프로젝트 구조 섹션');
    console.log('     - 주요 기능 설명');
    console.log('     - API 엔드포인트 목록\n');
  }

  if (needsUpdate.architecture) {
    console.log('  📄 ARCHITECTURE_GUIDE.md');
    console.log('     - 컴포넌트 구조');
    console.log('     - 서비스 레이어');
    console.log('     - 데이터 흐름도\n');
  }

  if (needsUpdate.projectStructure) {
    console.log('  📄 PROJECT_STRUCTURE.md');
    console.log('     - 폴더 구조');
    console.log('     - 파일 설명\n');
  }

  if (needsUpdate.implementationStatus) {
    console.log('  📄 IMPLEMENTATION_STATUS.md');
    console.log('     - 구현 상태 업데이트\n');
  }

  if (needsUpdate.documentationGuide) {
    console.log('  📄 docs/DOCUMENTATION_GUIDE.md');
    console.log('     - 문서 목록 확인\n');
  }

  if (needsUpdate.apiDocs) {
    console.log('  📄 API 문서');
    console.log('     - API 엔드포인트 설명 업데이트\n');
  }

  if (reasons.length > 0) {
    console.log('📋 상세 이유:');
    reasons.forEach(reason => console.log(`  - ${reason}`));
    console.log('');
  }

  console.log('💡 팁: 문서를 업데이트한 후 다시 커밋하거나, --no-verify로 스킵할 수 있습니다.');
  console.log('');

  // 경고만 출력하고 커밋은 계속 진행 (실패하지 않음)
  return 0;
}

if (require.main === module) {
  process.exit(main());
}

module.exports = { checkDocumentationNeeds, getChangedFiles };
