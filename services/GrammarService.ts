/**
 * GrammarService
 * 문법 교정 서비스 (Mock 구현)
 */

export interface GrammarCheckResult {
  original: string;
  corrected: string;
}

export class GrammarService {
  /**
   * 문법 교정을 수행하는 Mock 함수
   * 실제로는 AI 서비스에 요청을 보내야 함
   */
  static async check(text: string): Promise<GrammarCheckResult> {
    // Mock: 실제로는 AI API 호출
    return new Promise((resolve) => {
      setTimeout(() => {
        // 간단한 Mock 교정 로직 (예시)
        let corrected = text;
        // "I is" 또는 "i is"를 "I am"으로 먼저 처리 (순서 중요)
        corrected = corrected.replace(/\bi\s+is\b/gi, 'I am');
        // 소문자 i를 대문자 I로 (문장 시작이나 단독인 경우)
        corrected = corrected.replace(/\bi\b/g, 'I');
        corrected = corrected
          .replace(/\bcan't\b/g, "cannot") // can't를 cannot로
          .replace(/\bit's\b/g, "it is") // it's를 it is로
          .replace(/\bdont\b/g, "don't") // dont를 don't로
          .trim();

        resolve({
          original: text,
          corrected: corrected || text,
        });
      }, 1000); // 1초 딜레이로 API 호출 시뮬레이션
    });
  }
}
