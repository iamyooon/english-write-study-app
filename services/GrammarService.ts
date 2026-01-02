/**
 * GrammarService
 * OpenAI GPT를 사용한 문법 교정 서비스
 */

export interface GrammarCheckResult {
  original: string;
  corrected: string;
}

export class GrammarService {
  /**
   * OpenAI GPT를 사용하여 문법 교정을 수행합니다
   */
  static async check(text: string): Promise<GrammarCheckResult> {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error('OpenAI API 키가 설정되지 않았습니다. VITE_OPENAI_API_KEY 환경 변수를 설정해주세요.');
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful English grammar checker. Your task is to correct grammatical errors, spelling mistakes, and improve the English text. Return ONLY the corrected text without any explanation or additional comments. Preserve the original meaning and style as much as possible.'
            },
            {
              role: 'user',
              content: `Please correct the following English text:\n\n"${text}"\n\nReturn only the corrected text:`
            }
          ],
          temperature: 0.3, // 일관된 결과를 위해 낮은 temperature 사용
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error?.message || 
          `OpenAI API 오류: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      const corrected = data.choices[0]?.message?.content?.trim() || text;

      return {
        original: text,
        corrected: corrected,
      };
    } catch (error) {
      console.error('Grammar check error:', error);
      throw error;
    }
  }
}
