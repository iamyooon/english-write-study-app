/**
 * 작업 요약 파일을 UTF-8 (BOM 없음)로 생성하는 스크립트
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

const summary = `## 작업 완료 요약

### 완료된 작업
- .cursorrules 파일에 Jira 자동 로깅 규칙 추가
- 작업 완료 시 자동으로 Jira 코멘트를 남기는 규칙 설정
- 작업 요약 전용 스크립트 생성 (log-work-summary.mjs)
- Jira 코멘트 삭제 스크립트 생성 (delete-jira-comment.mjs)
- 한글 인코딩 문제 해결 (UTF-8 BOM 제거)

### 주요 변경사항
- .cursorrules 파일에 'Jira 자동 로깅 규칙' 섹션 추가
  - 기본 이슈 키: WEB-295 (개발 태스크)
  - 작업 요약 형식 가이드 포함
  - 자동 실행 규칙 명시
- log-work-summary.mjs 스크립트 생성
  - 마크다운 형식의 작업 요약을 Jira Document Format으로 변환
  - UTF-8 BOM 자동 제거 기능 추가
  - 헤딩, 리스트, 볼드 텍스트 지원
- delete-jira-comment.mjs 스크립트 생성
  - 최근 코멘트 자동 삭제 기능
  - 코멘트 ID 및 내용 확인 기능

### 생성/수정된 파일
- .cursorrules (Jira 자동 로깅 규칙 추가)
- scripts/log-work-summary.mjs (작업 요약 전용 스크립트)
- scripts/delete-jira-comment.mjs (코멘트 삭제 스크립트)
- scripts/test-jira-encoding.mjs (인코딩 테스트 스크립트)

### 해결된 문제
- 한글 인코딩 문제 해결 (UTF-8 BOM 제거)
- Jira Document Format 변환 로직 개선
- 리스트 아이템 연속 처리 개선`;

// UTF-8 (BOM 없음)로 파일 저장
const filePath = join(process.cwd(), 'temp-summary.txt');
writeFileSync(filePath, summary, { encoding: 'utf-8' });

console.log('✅ 작업 요약 파일 생성 완료: temp-summary.txt');
