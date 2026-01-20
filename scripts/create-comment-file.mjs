// Jira 코멘트용 파일 생성 헬퍼 스크립트
// 사용법: 파일을 직접 작성하세요 (jira-comment.txt)
//   또는: node scripts/create-comment-file.mjs (에디터가 열립니다)
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const filePath = join(process.cwd(), 'jira-comment.txt');

// 파일이 이미 있으면 읽어서 표시
if (existsSync(filePath)) {
  const content = readFileSync(filePath, 'utf-8').replace(/^\ufeff/, '');
  console.log('현재 파일 내용:');
  console.log(content);
  console.log('');
  console.log('파일을 수정하고 저장한 후 다음 명령을 실행하세요:');
  console.log(`  node scripts/log-to-jira.mjs @jira-comment.txt --issue WEB-295`);
} else {
  // 새 파일 생성 (템플릿)
  const template = `작업 요약을 여기에 작성하세요.

### 완료된 작업
- 작업 1
- 작업 2

### 다음 작업
- 작업 3
`;
  writeFileSync(filePath, '\ufeff' + template, 'utf-8');
  console.log(`✅ 파일 생성 완료: ${filePath}`);
  console.log(`   파일을 열어서 내용을 작성하고 저장하세요.`);
  console.log(`   저장 후: node scripts/log-to-jira.mjs @jira-comment.txt --issue WEB-295`);
  
  // 기본 에디터로 열기 시도
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    await execAsync(`notepad ${filePath}`);
  } catch (e) {
    // 에디터 열기 실패해도 계속 진행
  }
}
