import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SentenceService, Level } from './SentenceService';

// fetch를 mock
const mockFetch = vi.fn();
global.fetch = mockFetch;

// import.meta.env를 mock
vi.stubEnv('VITE_OPENAI_API_KEY', 'test-api-key');

describe('SentenceService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 기본적으로 API 키가 설정되어 있다고 가정
    vi.stubEnv('VITE_OPENAI_API_KEY', 'test-api-key');
  });

  describe('generateKoreanSentence', () => {
    it('API 키가 없으면 에러를 던진다', async () => {
      vi.stubEnv('VITE_OPENAI_API_KEY', '');

      await expect(
        SentenceService.generateKoreanSentence('elementary')
      ).rejects.toThrow('OpenAI API 키가 설정되지 않았습니다');
    });

    it('초등학교 수준의 한글 문장을 생성한다', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: '나는 사과를 좋아해요',
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await SentenceService.generateKoreanSentence('elementary');

      expect(result.koreanSentence).toBe('나는 사과를 좋아해요');
      expect(result.level).toBe('elementary');
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('중학교 수준의 한글 문장을 생성한다', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: '나는 어제 친구를 만났어요',
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await SentenceService.generateKoreanSentence('middle');

      expect(result.koreanSentence).toBe('나는 어제 친구를 만났어요');
      expect(result.level).toBe('middle');
    });

    it('고등학교 수준의 한글 문장을 생성한다', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: '나는 내일 시험을 위해 열심히 공부해야 해요',
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await SentenceService.generateKoreanSentence('high');

      expect(result.koreanSentence).toBe('나는 내일 시험을 위해 열심히 공부해야 해요');
      expect(result.level).toBe('high');
    });

    it('API 응답이 실패하면 에러를 던진다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      } as Response);

      await expect(
        SentenceService.generateKoreanSentence('elementary')
      ).rejects.toThrow('OpenAI API 오류');
    });

    it('API 응답 형식이 올바르지 않으면 에러를 던진다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ choices: [] }),
      } as Response);

      await expect(
        SentenceService.generateKoreanSentence('elementary')
      ).rejects.toThrow('OpenAI API 응답 형식이 올바르지 않습니다');
    });

    it('네트워크 오류가 발생하면 적절한 에러 메시지를 던진다', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(
        SentenceService.generateKoreanSentence('elementary')
      ).rejects.toThrow('네트워크 오류가 발생했습니다');
    });

    it('API 에러 응답의 메시지를 포함한다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({
          error: {
            message: 'Invalid API key',
          },
        }),
      } as Response);

      await expect(
        SentenceService.generateKoreanSentence('elementary')
      ).rejects.toThrow('Invalid API key');
    });
  });

  describe('evaluateEnglishSentence', () => {
    it('API 키가 없으면 에러를 던진다', async () => {
      vi.stubEnv('VITE_OPENAI_API_KEY', '');

      await expect(
        SentenceService.evaluateEnglishSentence('나는 사과를 좋아해요', 'I like apple', 'elementary')
      ).rejects.toThrow('OpenAI API 키가 설정되지 않았습니다');
    });

    it('영어 문장을 평가하고 결과를 반환한다', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                correctEnglish: 'I like apples',
                score: 85,
                feedback: '거의 정확합니다. 단수형 대신 복수형을 사용하세요.',
                errors: [
                  {
                    type: 'grammar',
                    description: '단수형/복수형 오류',
                    suggestion: 'apple 대신 apples를 사용하세요',
                  },
                ],
              }),
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await SentenceService.evaluateEnglishSentence(
        '나는 사과를 좋아해요',
        'I like apple',
        'elementary'
      );

      expect(result.koreanSentence).toBe('나는 사과를 좋아해요');
      expect(result.userEnglish).toBe('I like apple');
      expect(result.correctEnglish).toBe('I like apples');
      expect(result.score).toBe(85);
      expect(result.feedback).toBe('거의 정확합니다. 단수형 대신 복수형을 사용하세요.');
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].type).toBe('grammar');
    });

    it('JSON 파싱 실패 시 기본값을 반환한다', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Invalid JSON response',
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await SentenceService.evaluateEnglishSentence(
        '나는 사과를 좋아해요',
        'I like apple',
        'elementary'
      );

      expect(result.correctEnglish).toBe('I like apple');
      expect(result.score).toBe(50);
      expect(result.feedback).toBe('평가를 완료할 수 없었습니다.');
      expect(result.errors).toEqual([]);
    });

    it('JSON 코드 블록이 있어도 파싱한다', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: '```json\n{"correctEnglish": "I like apples", "score": 90, "feedback": "좋습니다", "errors": []}\n```',
            },
          },
        ],
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await SentenceService.evaluateEnglishSentence(
        '나는 사과를 좋아해요',
        'I like apple',
        'elementary'
      );

      expect(result.correctEnglish).toBe('I like apples');
      expect(result.score).toBe(90);
    });

    it('API 응답이 실패하면 에러를 던진다', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({}),
      } as Response);

      await expect(
        SentenceService.evaluateEnglishSentence('나는 사과를 좋아해요', 'I like apple', 'elementary')
      ).rejects.toThrow('OpenAI API 오류');
    });

    it('네트워크 오류가 발생하면 적절한 에러 메시지를 던진다', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(
        SentenceService.evaluateEnglishSentence('나는 사과를 좋아해요', 'I like apple', 'elementary')
      ).rejects.toThrow('네트워크 오류가 발생했습니다');
    });

    it('모든 수준에서 평가가 가능하다', async () => {
      const levels: Level[] = ['elementary', 'middle', 'high'];
      
      for (const level of levels) {
        const mockResponse = {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  correctEnglish: 'I like apples',
                  score: 90,
                  feedback: '좋습니다',
                  errors: [],
                }),
              },
            },
          ],
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockResponse,
        } as Response);

        const result = await SentenceService.evaluateEnglishSentence(
          '나는 사과를 좋아해요',
          'I like apple',
          level
        );

        expect(result.score).toBe(90);
      }
    });
  });
});

