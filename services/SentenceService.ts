/**
 * SentenceService
 * OpenAI GPT를 사용한 한글 문장 생성 및 영어 문장 평가 서비스
 */

export type Level = 'elementary' | 'middle' | 'high';

export interface SentenceGenerationResult {
  koreanSentence: string;
  level: Level;
}

export interface SentenceEvaluationResult {
  koreanSentence: string;
  userEnglish: string;
  correctEnglish: string;
  score: number;
  feedback: string;
  errors: Array<{
    type: string;
    description: string;
    suggestion: string;
  }>;
}

export class SentenceService {
  /**
   * 수준에 맞는 한글 문장 생성
   */
  static async generateKoreanSentence(level: Level): Promise<SentenceGenerationResult> {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error('OpenAI API 키가 설정되지 않았습니다. VITE_OPENAI_API_KEY 환경 변수를 설정해주세요.');
      }

      const levelNames = {
        elementary: '초등학교',
        middle: '중학교',
        high: '고등학교'
      };

      const levelDescriptions = {
        elementary: '초등학교 수준의 간단한 일상 표현 (예: "나는 사과를 좋아해요", "오늘 날씨가 좋아요")',
        middle: '중학교 수준의 기본적인 문장 (예: "나는 어제 친구를 만났어요", "이 책은 정말 재미있어요")',
        high: '고등학교 수준의 복잡한 문장 (예: "나는 내일 시험을 위해 열심히 공부해야 해요", "그 영화는 예상보다 훨씬 감동적이었어요")'
      };

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
              content: `You are a helpful Korean language teacher creating practice sentences for ${levelNames[level]} level students. Your task is to generate ONE simple Korean sentence that is appropriate for ${levelDescriptions[level]} level. Return ONLY the Korean sentence without any explanation, translation, or additional text.`
            },
            {
              role: 'user',
              content: `${levelNames[level]} 수준에 맞는 한글 문장을 하나 생성해주세요. 영어로 번역할 수 있는 일상적인 표현이면 좋습니다.`
            }
          ],
          temperature: 0.7,
          max_tokens: 100,
        }),
      });

      if (!response.ok) {
        let errorMessage = `OpenAI API 오류: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('OpenAI API 응답 형식이 올바르지 않습니다.');
      }
      
      const koreanSentence = data.choices[0].message.content?.trim() || '';

      return {
        koreanSentence,
        level,
      };
    } catch (error) {
      console.error('Sentence generation error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
      }
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error(`예상치 못한 오류가 발생했습니다: ${String(error)}`);
    }
  }

  /**
   * 사용자가 작성한 영어 문장 평가
   */
  static async evaluateEnglishSentence(
    koreanSentence: string,
    userEnglish: string,
    level: Level
  ): Promise<SentenceEvaluationResult> {
    try {
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      if (!apiKey) {
        throw new Error('OpenAI API 키가 설정되지 않았습니다. VITE_OPENAI_API_KEY 환경 변수를 설정해주세요.');
      }

      const levelNames = {
        elementary: '초등학교',
        middle: '중학교',
        high: '고등학교'
      };

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
              content: `You are a helpful English teacher evaluating a student's translation. The student is at ${levelNames[level]} level. Your task is to evaluate the English sentence and provide detailed feedback in Korean. Return a JSON object with the following structure:
{
  "correctEnglish": "the correct English translation",
  "score": 0-100,
  "feedback": "overall feedback in Korean",
  "errors": [
    {
      "type": "grammar/spelling/word_choice/etc",
      "description": "error description in Korean",
      "suggestion": "suggestion in Korean"
    }
  ]
}

Return ONLY the JSON object, no additional text.`
            },
            {
              role: 'user',
              content: `한글 문장: "${koreanSentence}"
학생이 작성한 영어 문장: "${userEnglish}"
수준: ${levelNames[level]}

위 영어 문장을 평가하고 피드백을 제공해주세요.`
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        let errorMessage = `OpenAI API 오류: ${response.status} ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          if (errorData.error?.message) {
            errorMessage = errorData.error.message;
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('OpenAI API 응답 형식이 올바르지 않습니다.');
      }
      
      const content = data.choices[0].message.content?.trim() || '';
      
      // JSON 파싱
      let evaluation;
      try {
        // JSON 코드 블록 제거
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        const jsonText = jsonMatch ? jsonMatch[0] : content;
        evaluation = JSON.parse(jsonText);
      } catch (parseError) {
        // JSON 파싱 실패 시 기본값
        evaluation = {
          correctEnglish: userEnglish,
          score: 50,
          feedback: '평가를 완료할 수 없었습니다.',
          errors: []
        };
      }

      return {
        koreanSentence,
        userEnglish,
        correctEnglish: evaluation.correctEnglish || userEnglish,
        score: evaluation.score || 0,
        feedback: evaluation.feedback || '평가를 완료할 수 없었습니다.',
        errors: evaluation.errors || [],
      };
    } catch (error) {
      console.error('Sentence evaluation error:', error);
      
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.');
      }
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error(`예상치 못한 오류가 발생했습니다: ${String(error)}`);
    }
  }
}

