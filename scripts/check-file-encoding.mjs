// 파일 인코딩 확인 스크립트
import { readFileSync } from 'fs';
import { join } from 'path';

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node scripts/check-file-encoding.mjs <file-path>');
  process.exit(1);
}

const fullPath = join(process.cwd(), filePath);
const buffer = readFileSync(fullPath);

console.log('파일 크기:', buffer.length, '바이트');
console.log('처음 30바이트 (hex):', buffer.slice(0, 30).toString('hex'));

// BOM 확인
if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
  console.log('BOM: UTF-8 BOM 감지');
  const text = buffer.slice(3).toString('utf-8');
  console.log('UTF-8로 읽은 텍스트:', text);
  console.log('텍스트 바이트 (hex):', Buffer.from(text, 'utf-8').toString('hex'));
  console.log('한글 정상 여부:', /테스트|작업|완료/.test(text));
} else if (buffer.length >= 2 && buffer[0] === 0xFF && buffer[1] === 0xFE) {
  console.log('BOM: UTF-16 LE BOM 감지');
  const text = buffer.slice(2).toString('utf16le');
  console.log('UTF-16 LE로 읽은 텍스트:', text);
  console.log('한글 정상 여부:', /테스트|작업|완료/.test(text));
} else {
  console.log('BOM: 없음');
  // UTF-8로 시도
  const utf8Text = buffer.toString('utf-8');
  console.log('UTF-8로 읽은 텍스트:', utf8Text);
  console.log('한글 정상 여부:', /테스트|작업|완료/.test(utf8Text));
  
  // UTF-16 LE로 시도
  const utf16Text = buffer.toString('utf16le');
  console.log('UTF-16 LE로 읽은 텍스트:', utf16Text);
  console.log('한글 정상 여부:', /테스트|작업|완료/.test(utf16Text));
}
