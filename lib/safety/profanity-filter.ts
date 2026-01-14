/**
 * 클라이언트 사이드 금칙어 필터
 * 
 * 3중 필터링의 첫 번째 단계: 클라이언트에서 즉시 차단
 */

// 기본 금칙어 목록 (한국어)
const PROFANITY_WORDS = [
  // 욕설 (예시 - 실제로는 더 포괄적인 목록 필요)
  '바보',
  '멍청이',
  // 영어 욕설
  'bad',
  'stupid',
  // 추가 금칙어는 필요에 따라 확장
]

/**
 * 텍스트에 금칙어가 포함되어 있는지 확인
 */
export function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase()
  return PROFANITY_WORDS.some((word) => lowerText.includes(word.toLowerCase()))
}

/**
 * 금칙어 필터링 (클라이언트 사이드)
 * 
 * @returns {isValid: boolean, message?: string}
 */
export function filterProfanity(text: string): { isValid: boolean; message?: string } {
  if (containsProfanity(text)) {
    return {
      isValid: false,
      message: '나쁜 말은 안 돼요! 다른 표현을 사용해주세요.',
    }
  }

  return { isValid: true }
}
