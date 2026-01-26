#!/usr/bin/env node
/**
 * 문서 자동 업데이트 스크립트
 * 변경된 파일을 분석하여 관련 문서를 자동으로 업데이트
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

// 디렉토리 구조 스캔
function scanDirectory(dir, prefix = '', maxDepth = 3, currentDepth = 0) {
  if (currentDepth >= maxDepth) return '';
  
  const items = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      // 숨김 파일/디렉토리 제외
      if (entry.name.startsWith('.')) continue;
      // node_modules, .next 등 제외
      if (['node_modules', '.next', 'dist', 'build', 'coverage'].includes(entry.name)) continue;
      
      const fullPath = path.join(dir, entry.name);
      const relativePath = path.relative(process.cwd(), fullPath);
      
      if (entry.isDirectory()) {
        items.push({
          type: 'dir',
          name: entry.name,
          path: relativePath,
          prefix: prefix + '├── ',
          children: scanDirectory(fullPath, prefix + '│   ', maxDepth, currentDepth + 1)
        });
      } else if (entry.isFile() && /\.(ts|tsx|js|jsx)$/.test(entry.name)) {
        items.push({
          type: 'file',
          name: entry.name,
          path: relativePath,
          prefix: prefix + '├── '
        });
      }
    }
  } catch (error) {
    // 디렉토리 읽기 실패 시 무시
  }
  
  return items;
}

// API 라우트 목록 가져오기
function getApiRoutes() {
  const apiDir = path.join(process.cwd(), 'app', 'api');
  if (!fs.existsSync(apiDir)) return [];
  
  const routes = [];
  
  function scanApiDir(dir, basePath = '') {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;
        
        const fullPath = path.join(dir, entry.name);
        const routePath = basePath ? `${basePath}/${entry.name}` : entry.name;
        
        if (entry.isDirectory()) {
          scanApiDir(fullPath, routePath);
        } else if (entry.name === 'route.ts' || entry.name === 'route.tsx') {
          routes.push({
            path: `/api/${routePath.replace(/\/route\.(ts|tsx)$/, '')}`,
            filePath: path.relative(process.cwd(), fullPath)
          });
        }
      }
    } catch (error) {
      // 무시
    }
  }
  
  scanApiDir(apiDir);
  return routes;
}

// 컴포넌트 목록 가져오기
function getComponents() {
  const componentsDir = path.join(process.cwd(), 'components');
  if (!fs.existsSync(componentsDir)) return [];
  
  const components = [];
  
  function scanComponentsDir(dir, basePath = '') {
    try {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.name.startsWith('.')) continue;
        if (entry.name.endsWith('.test.tsx') || entry.name.endsWith('.test.ts')) continue;
        
        const fullPath = path.join(dir, entry.name);
        const componentPath = basePath ? `${basePath}/${entry.name}` : entry.name;
        
        if (entry.isDirectory()) {
          scanComponentsDir(fullPath, componentPath);
        } else if (/\.(tsx|ts)$/.test(entry.name)) {
          components.push({
            name: entry.name.replace(/\.(tsx|ts)$/, ''),
            path: componentPath,
            filePath: path.relative(process.cwd(), fullPath)
          });
        }
      }
    } catch (error) {
      // 무시
    }
  }
  
  scanComponentsDir(componentsDir);
  return components;
}

// README.md의 프로젝트 구조 섹션 업데이트
function updateReadmeStructure(changedFiles) {
  const readmePath = path.join(process.cwd(), 'README.md');
  if (!fs.existsSync(readmePath)) return false;
  
  let content = fs.readFileSync(readmePath, 'utf-8');
  
  // API 라우트가 변경되었는지 확인
  const hasApiChanges = changedFiles.some(f => f.startsWith('app/api/'));
  const hasPageChanges = changedFiles.some(f => f.includes('page.tsx'));
  
  if (!hasApiChanges && !hasPageChanges) return false;
  
  // API 라우트 목록 생성
  const apiRoutes = getApiRoutes();
  const apiRoutesSection = apiRoutes
    .map(route => {
      const routePath = route.path.replace('/api/', '');
      const parts = routePath.split('/');
      const indent = '│   │   '.repeat(parts.length - 1);
      const isLast = route === apiRoutes[apiRoutes.length - 1];
      const connector = isLast ? '└── ' : '├── ';
      
      // 설명 추출 (파일에서 주석 읽기)
      let description = '';
      try {
        const routeContent = fs.readFileSync(route.filePath, 'utf-8');
        const commentMatch = routeContent.match(/\/\*\*[\s\S]*?\*\//);
        if (commentMatch) {
          const lines = commentMatch[0].split('\n');
          const descLine = lines.find(l => l.trim() && !l.includes('*') || l.includes('*') && l.trim() !== '/**' && l.trim() !== '*/');
          if (descLine) {
            description = descLine.replace(/\*/g, '').trim();
          }
        }
      } catch (e) {
        // 무시
      }
      
      return `${indent}${connector}${parts[parts.length - 1]}/        # ${description || route.path}`;
    })
    .join('\n');
  
  // 프로젝트 구조 섹션 찾기 및 업데이트
  const structureStart = content.indexOf('## 📁 프로젝트 구조');
  if (structureStart === -1) return false;
  
  const structureEnd = content.indexOf('\n## ', structureStart + 1);
  const beforeStructure = content.substring(0, structureStart);
  const afterStructure = structureEnd !== -1 ? content.substring(structureEnd) : '';
  
  // API 라우트 부분만 업데이트
  const apiSectionRegex = /(│   │   └── study\/[\s\S]*?)(│   ├── onboarding)/;
  const match = content.match(apiSectionRegex);
  
  if (match && apiRoutes.length > 0) {
    const studyRoutes = apiRoutes.filter(r => r.path.includes('/study/'));
    const studyRoutesText = studyRoutes
      .map(route => {
        const routeName = route.path.split('/').pop();
        const desc = route.path.includes('generate-mission') ? '키보드 입력 미션 조회 (DB 기반, 학년 1-6)' :
                     route.path.includes('generate-drag-drop-mission') ? 'Drag & Drop 미션 조회 (DB 기반, 학년 1-3)' :
                     route.path.includes('submit') && !route.path.includes('drag-drop') ? '영어 문장 제출 및 피드백' :
                     route.path.includes('drag-drop-submit') ? 'Drag & Drop 미션 제출' : '';
        return `│   │       ├── ${routeName}/        # ${desc}`;
      })
      .join('\n');
    
    content = content.replace(
      /(│   │   └── study\/[\s\S]*?)(│   ├── onboarding)/,
      `│   │   └── study/\n${studyRoutesText}\n$2`
    );
  }
  
  fs.writeFileSync(readmePath, content, 'utf-8');
  return true;
}

// PROJECT_STRUCTURE.md 업데이트
function updateProjectStructure(changedFiles) {
  const structurePath = path.join(process.cwd(), 'PROJECT_STRUCTURE.md');
  if (!fs.existsSync(structurePath)) return false;
  
  const hasApiChanges = changedFiles.some(f => f.startsWith('app/api/'));
  const hasComponentChanges = changedFiles.some(f => f.startsWith('components/'));
  
  if (!hasApiChanges && !hasComponentChanges) return false;
  
  let content = fs.readFileSync(structurePath, 'utf-8');
  
  // API Routes 섹션 업데이트
  if (hasApiChanges) {
    const apiRoutes = getApiRoutes();
    const apiSection = apiRoutes
      .map(route => {
        const routePath = route.path.replace('/api/', '');
        return `│   │   ├── ${routePath.split('/').join('/')}/`;
      })
      .join('\n');
    
    // API Routes 섹션 찾아서 업데이트
    const apiSectionRegex = /(│   ├── api\/[\s\S]*?)(│   ├── globals\.css)/;
    if (apiSectionRegex.test(content)) {
      content = content.replace(
        apiSectionRegex,
        `│   ├── api/                     # API Routes\n${apiSection}\n$2`
      );
    }
  }
  
  // Components 섹션 업데이트
  if (hasComponentChanges) {
    const components = getComponents();
    const componentsSection = components
      .slice(0, 10) // 처음 10개만
      .map(comp => `│   ├── ${comp.name}.tsx`)
      .join('\n');
    
    const componentsRegex = /(├── components\/[\s\S]*?)(├── services\/)/;
    if (componentsRegex.test(content)) {
      content = content.replace(
        componentsRegex,
        `├── components/                   # React 컴포넌트\n${componentsSection}\n│   └── ...\n$2`
      );
    }
  }
  
  fs.writeFileSync(structurePath, content, 'utf-8');
  return true;
}

// DOCUMENTATION_GUIDE.md의 마지막 업데이트 날짜 업데이트
function updateDocumentationGuide() {
  const guidePath = path.join(process.cwd(), 'docs', 'DOCUMENTATION_GUIDE.md');
  if (!fs.existsSync(guidePath)) return false;
  
  let content = fs.readFileSync(guidePath, 'utf-8');
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  
  // 마지막 업데이트 날짜 업데이트
  content = content.replace(
    /\*\*마지막 업데이트\*\*: .*/,
    `**마지막 업데이트**: ${today}`
  );
  
  fs.writeFileSync(guidePath, content, 'utf-8');
  return true;
}

// 메인 실행
function main() {
  const changedFiles = getChangedFiles();
  
  if (changedFiles.length === 0) {
    console.log('✅ 변경된 파일 없음');
    return 0;
  }
  
  console.log('📚 문서 자동 업데이트 시작...\n');
  
  let updated = false;
  
  // README.md 업데이트
  if (updateReadmeStructure(changedFiles)) {
    console.log('✅ README.md 프로젝트 구조 섹션 업데이트 완료');
    updated = true;
  }
  
  // PROJECT_STRUCTURE.md 업데이트
  if (updateProjectStructure(changedFiles)) {
    console.log('✅ PROJECT_STRUCTURE.md 업데이트 완료');
    updated = true;
  }
  
  // DOCUMENTATION_GUIDE.md 업데이트
  if (updateDocumentationGuide()) {
    console.log('✅ docs/DOCUMENTATION_GUIDE.md 업데이트 날짜 갱신 완료');
    updated = true;
  }
  
  if (updated) {
    console.log('\n📦 업데이트된 문서를 스테이징 영역에 추가합니다...');
    
    // 업데이트된 문서를 스테이징
    const docFiles = ['README.md', 'PROJECT_STRUCTURE.md', 'docs/DOCUMENTATION_GUIDE.md'];
    for (const file of docFiles) {
      const filePath = path.join(process.cwd(), file);
      if (fs.existsSync(filePath)) {
        try {
          execSync(`git add "${file}"`, { stdio: 'pipe' });
          console.log(`  ✓ ${file} 스테이징 완료`);
        } catch (error) {
          // 무시
        }
      }
    }
    
    console.log('\n✅ 문서 자동 업데이트 완료!');
  } else {
    console.log('ℹ️  업데이트할 문서가 없습니다.');
  }
  
  return 0;
}

if (require.main === module) {
  process.exit(main());
}

module.exports = { 
  updateReadmeStructure, 
  updateProjectStructure, 
  updateDocumentationGuide,
  getChangedFiles 
};
