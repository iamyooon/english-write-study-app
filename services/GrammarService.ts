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
        let errorMessage = `OpenAI API 오류: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          } else if (errorData.error) {
            errorMessage = JSON.stringify(errorData.error);
          }
        } catch (parseError) {
          // JSON 파싱 실패 시 기본 메시지 사용
          console.error('Error parsing error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('OpenAI API 응답 형식이 올바르지 않습니다.');
      }
      
      const corrected = data.choices[0].message.content?.trim() || text;

      return {
        original: text,
        corrected: corrected,
      };
    } catch (error) {
      console.error('Grammar check error:', error);
      
      // 네트워크 오류 처리
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
      }
      
      // 이미 Error 객체인 경우 그대로 전달
      if (error instanceof Error) {
        throw error;
      }
      
      // 기타 오류
      throw new Error(`예상치 못한 오류가 발생했습니다: ${String(error)}`);
    }
  }
}
