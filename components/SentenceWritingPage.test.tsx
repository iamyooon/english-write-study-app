import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SentenceWritingPage from './SentenceWritingPage';
import { SentenceService } from '../services/SentenceService';

// SentenceService를 mock
vi.mock('../services/SentenceService', () => ({
  SentenceService: {
    generateKoreanSentence: vi.fn(),
    evaluateEnglishSentence: vi.fn(),
  },
}));

describe('SentenceWritingPage', () => {
  const mockGenerateKoreanSentence = vi.mocked(SentenceService.generateKoreanSentence);
  const mockEvaluateEnglishSentence = vi.mocked(SentenceService.evaluateEnglishSentence);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 렌더링', () => {
    it('컴포넌트가 정상적으로 렌더링된다', () => {
      render(<SentenceWritingPage />);
      
      expect(screen.getByText('영어 문장 쓰기')).toBeInTheDocument();
      expect(screen.getByText('초등학교')).toBeInTheDocument();
      expect(screen.getByText('중학교')).toBeInTheDocument();
      expect(screen.getByText('고등학교')).toBeInTheDocument();
    });

    it('초기 상태에서 중학교가 선택되어 있다', () => {
      render(<SentenceWritingPage />);
      
      const middleButton = screen.getByRole('button', { name: '중학교' });
      expect(middleButton).toHaveClass('bg-indigo-600');
    });

    it('초기 상태에서 한글 문장이 비어있다', () => {
      render(<SentenceWritingPage />);
      
      expect(screen.getByText('"새 문장 생성" 버튼을 클릭하여 한글 문장을 받아보세요.')).toBeInTheDocument();
    });

    it('초기 상태에서 영어 입력 영역이 비활성화되어 있다', () => {
      render(<SentenceWritingPage />);
      
      const textarea = screen.getByPlaceholderText('여기에 영어 문장을 작성해주세요...');
      expect(textarea).toBeDisabled();
    });
  });

  describe('수준 선택', () => {
    it('초등학교 버튼을 클릭하면 초등학교가 선택된다', async () => {
      const user = userEvent.setup();
      render(<SentenceWritingPage />);
      
      const elementaryButton = screen.getByRole('button', { name: '초등학교' });
      await user.click(elementaryButton);
      
      expect(elementaryButton).toHaveClass('bg-indigo-600');
    });

    it('고등학교 버튼을 클릭하면 고등학교가 선택된다', async () => {
      const user = userEvent.setup();
      render(<SentenceWritingPage />);
      
      const highButton = screen.getByRole('button', { name: '고등학교' });
      await user.click(highButton);
      
      expect(highButton).toHaveClass('bg-indigo-600');
    });
  });

  describe('한글 문장 생성', () => {
    it('"새 문장 생성" 버튼을 클릭하면 SentenceService.generateKoreanSentence가 호출된다', async () => {
      const user = userEvent.setup();
      const mockResult = {
        koreanSentence: '나는 사과를 좋아해요',
        level: 'elementary' as const,
      };
      mockGenerateKoreanSentence.mockResolvedValue(mockResult);

      render(<SentenceWritingPage />);
      
      const generateButton = screen.getByRole('button', { name: '새 문장 생성' });
      await user.click(generateButton);

      expect(mockGenerateKoreanSentence).toHaveBeenCalledWith('middle');
      expect(mockGenerateKoreanSentence).toHaveBeenCalledTimes(1);
    });

    it('선택된 수준에 따라 올바른 수준으로 문장을 생성한다', async () => {
      const user = userEvent.setup();
      const mockResult = {
        koreanSentence: '나는 사과를 좋아해요',
        level: 'elementary' as const,
      };
      mockGenerateKoreanSentence.mockResolvedValue(mockResult);

      render(<SentenceWritingPage />);
      
      // 초등학교 선택
      const elementaryButton = screen.getByRole('button', { name: '초등학교' });
      await user.click(elementaryButton);
      
      const generateButton = screen.getByRole('button', { name: '새 문장 생성' });
      await user.click(generateButton);

      expect(mockGenerateKoreanSentence).toHaveBeenCalledWith('elementary');
    });

    it('문장 생성 중에는 버튼이 비활성화되고 로딩 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      const mockResult = {
        koreanSentence: '나는 사과를 좋아해요',
        level: 'middle' as const,
      };
      // Promise를 즉시 resolve하지 않도록 지연
      mockGenerateKoreanSentence.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockResult), 100))
      );

      render(<SentenceWritingPage />);
      
      const generateButton = screen.getByRole('button', { name: '새 문장 생성' });
      await user.click(generateButton);

      expect(generateButton).toBeDisabled();
      expect(screen.getByText('생성 중...')).toBeInTheDocument();
    });

    it('문장 생성 성공 시 한글 문장이 표시된다', async () => {
      const user = userEvent.setup();
      const mockResult = {
        koreanSentence: '나는 사과를 좋아해요',
        level: 'middle' as const,
      };
      mockGenerateKoreanSentence.mockResolvedValue(mockResult);

      render(<SentenceWritingPage />);
      
      const generateButton = screen.getByRole('button', { name: '새 문장 생성' });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('나는 사과를 좋아해요')).toBeInTheDocument();
      });
    });

    it('문장 생성 시 이전 입력과 결과가 초기화된다', async () => {
      const user = userEvent.setup();
      const mockResult = {
        koreanSentence: '나는 사과를 좋아해요',
        level: 'middle' as const,
      };
      mockGenerateKoreanSentence.mockResolvedValue(mockResult);

      render(<SentenceWritingPage />);
      
      // 먼저 문장 생성
      const generateButton = screen.getByRole('button', { name: '새 문장 생성' });
      await user.click(generateButton);
      
      await waitFor(() => {
        expect(screen.getByText('나는 사과를 좋아해요')).toBeInTheDocument();
      });

      // 영어 입력
      const textarea = screen.getByPlaceholderText('여기에 영어 문장을 작성해주세요...');
      await user.type(textarea, 'I like apple');

      // 다시 문장 생성
      await user.click(generateButton);

      await waitFor(() => {
        expect(textarea).toHaveValue('');
      });
    });

    it('문장 생성 실패 시 에러 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      mockGenerateKoreanSentence.mockRejectedValue(new Error('API Error'));

      render(<SentenceWritingPage />);
      
      const generateButton = screen.getByRole('button', { name: '새 문장 생성' });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('API Error')).toBeInTheDocument();
      });
    });
  });

  describe('영어 문장 입력', () => {
    it('한글 문장이 생성되면 영어 입력 영역이 활성화된다', async () => {
      const user = userEvent.setup();
      const mockResult = {
        koreanSentence: '나는 사과를 좋아해요',
        level: 'middle' as const,
      };
      mockGenerateKoreanSentence.mockResolvedValue(mockResult);

      render(<SentenceWritingPage />);
      
      const generateButton = screen.getByRole('button', { name: '새 문장 생성' });
      await user.click(generateButton);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText('여기에 영어 문장을 작성해주세요...');
        expect(textarea).not.toBeDisabled();
      });
    });

    it('영어 문장을 입력할 수 있다', async () => {
      const user = userEvent.setup();
      const mockResult = {
        koreanSentence: '나는 사과를 좋아해요',
        level: 'middle' as const,
      };
      mockGenerateKoreanSentence.mockResolvedValue(mockResult);

      render(<SentenceWritingPage />);
      
      const generateButton = screen.getByRole('button', { name: '새 문장 생성' });
      await user.click(generateButton);

      await waitFor(() => {
        const textarea = screen.getByPlaceholderText('여기에 영어 문장을 작성해주세요...');
        expect(textarea).not.toBeDisabled();
      });

      const textarea = screen.getByPlaceholderText('여기에 영어 문장을 작성해주세요...');
      await user.type(textarea, 'I like apple');

      expect(textarea).toHaveValue('I like apple');
    });
  });

  describe('평가 기능', () => {
    it('한글 문장이 없으면 평가 버튼 클릭 시 에러 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      render(<SentenceWritingPage />);
      
      const evaluateButton = screen.getByRole('button', { name: /AI 평가/i });
      await user.click(evaluateButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveTextContent('먼저 한글 문장을 생성해주세요');
      }, { timeout: 3000 });
      expect(mockEvaluateEnglishSentence).not.toHaveBeenCalled();
    });

    it('영어 문장이 없으면 평가 버튼 클릭 시 에러 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      const mockResult = {
        koreanSentence: '나는 사과를 좋아해요',
        level: 'middle' as const,
      };
      mockGenerateKoreanSentence.mockResolvedValue(mockResult);

      render(<SentenceWritingPage />);
      
      const generateButton = screen.getByRole('button', { name: '새 문장 생성' });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('나는 사과를 좋아해요')).toBeInTheDocument();
      });

      const evaluateButton = screen.getByRole('button', { name: /AI 평가/i });
      await user.click(evaluateButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
        expect(screen.getByRole('alert')).toHaveTextContent('영어 문장을 입력해주세요');
      }, { timeout: 3000 });
      expect(mockEvaluateEnglishSentence).not.toHaveBeenCalled();
    });

    it('유효한 입력이 있을 때 평가 버튼을 클릭하면 SentenceService.evaluateEnglishSentence가 호출된다', async () => {
      const user = userEvent.setup();
      const generateResult = {
        koreanSentence: '나는 사과를 좋아해요',
        level: 'middle' as const,
      };
      const evaluateResult = {
        koreanSentence: '나는 사과를 좋아해요',
        userEnglish: 'I like apple',
        correctEnglish: 'I like apples',
        score: 85,
        feedback: '거의 정확합니다.',
        errors: [],
      };
      mockGenerateKoreanSentence.mockResolvedValue(generateResult);
      mockEvaluateEnglishSentence.mockResolvedValue(evaluateResult);

      render(<SentenceWritingPage />);
      
      const generateButton = screen.getByRole('button', { name: '새 문장 생성' });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('나는 사과를 좋아해요')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText('여기에 영어 문장을 작성해주세요...');
      await user.type(textarea, 'I like apple');

      const evaluateButton = screen.getByRole('button', { name: /AI 평가/i });
      await user.click(evaluateButton);

      expect(mockEvaluateEnglishSentence).toHaveBeenCalledWith(
        '나는 사과를 좋아해요',
        'I like apple',
        'middle'
      );
    });

    it('평가 중에는 버튼이 비활성화되고 로딩 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      const generateResult = {
        koreanSentence: '나는 사과를 좋아해요',
        level: 'middle' as const,
      };
      const evaluateResult = {
        koreanSentence: '나는 사과를 좋아해요',
        userEnglish: 'I like apple',
        correctEnglish: 'I like apples',
        score: 85,
        feedback: '거의 정확합니다.',
        errors: [],
      };
      mockGenerateKoreanSentence.mockResolvedValue(generateResult);
      // Promise를 즉시 resolve하지 않도록 지연
      mockEvaluateEnglishSentence.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(evaluateResult), 100))
      );

      render(<SentenceWritingPage />);
      
      const generateButton = screen.getByRole('button', { name: '새 문장 생성' });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('나는 사과를 좋아해요')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText('여기에 영어 문장을 작성해주세요...');
      await user.type(textarea, 'I like apple');

      const evaluateButton = screen.getByRole('button', { name: /AI 평가/i });
      await user.click(evaluateButton);

      expect(evaluateButton).toBeDisabled();
      expect(screen.getByText('평가 중...')).toBeInTheDocument();
    });

    it('평가 결과가 성공적으로 표시된다', async () => {
      const user = userEvent.setup();
      const generateResult = {
        koreanSentence: '나는 사과를 좋아해요',
        level: 'middle' as const,
      };
      const evaluateResult = {
        koreanSentence: '나는 사과를 좋아해요',
        userEnglish: 'I like apple',
        correctEnglish: 'I like apples',
        score: 85,
        feedback: '거의 정확합니다.',
        errors: [],
      };
      mockGenerateKoreanSentence.mockResolvedValue(generateResult);
      mockEvaluateEnglishSentence.mockResolvedValue(evaluateResult);

      render(<SentenceWritingPage />);
      
      const generateButton = screen.getByRole('button', { name: '새 문장 생성' });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('나는 사과를 좋아해요')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText('여기에 영어 문장을 작성해주세요...');
      await user.type(textarea, 'I like apple');

      const evaluateButton = screen.getByRole('button', { name: /AI 평가/i });
      await user.click(evaluateButton);

      await waitFor(() => {
        expect(screen.getByText('평가 결과')).toBeInTheDocument();
      });

      expect(screen.getByText('85점')).toBeInTheDocument();
      // 한글 문장이 여러 곳에 나타나므로 getAllByText 사용
      const koreanSentences = screen.getAllByText('나는 사과를 좋아해요');
      expect(koreanSentences.length).toBeGreaterThan(0);
      // "작성한 영어 문장" 섹션 내에서 찾기
      const userEnglishSection = screen.getByText('작성한 영어 문장').closest('div');
      expect(userEnglishSection).toHaveTextContent('I like apple');
      expect(screen.getByText('거의 정확합니다.')).toBeInTheDocument();
    });

    it('평가 결과에 오류가 있으면 오류 목록이 표시된다', async () => {
      const user = userEvent.setup();
      const generateResult = {
        koreanSentence: '나는 사과를 좋아해요',
        level: 'middle' as const,
      };
      const evaluateResult = {
        koreanSentence: '나는 사과를 좋아해요',
        userEnglish: 'I like apple',
        correctEnglish: 'I like apples',
        score: 70,
        feedback: '일부 오류가 있습니다.',
        errors: [
          {
            type: 'grammar',
            description: '단수형/복수형 오류',
            suggestion: 'apple 대신 apples를 사용하세요',
          },
        ],
      };
      mockGenerateKoreanSentence.mockResolvedValue(generateResult);
      mockEvaluateEnglishSentence.mockResolvedValue(evaluateResult);

      render(<SentenceWritingPage />);
      
      const generateButton = screen.getByRole('button', { name: '새 문장 생성' });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('나는 사과를 좋아해요')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText('여기에 영어 문장을 작성해주세요...');
      await user.type(textarea, 'I like apple');

      const evaluateButton = screen.getByRole('button', { name: /AI 평가/i });
      await user.click(evaluateButton);

      await waitFor(() => {
        expect(screen.getByText(/발견된 오류/)).toBeInTheDocument();
      });

      // 에러 목록이 표시되는지 확인
      expect(screen.getByText(/grammar/)).toBeInTheDocument();
      expect(screen.getByText(/단수형\/복수형 오류/)).toBeInTheDocument();
      expect(screen.getByText(/apple 대신 apples를 사용하세요/)).toBeInTheDocument();
    });

    it('평가 실패 시 에러 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      const generateResult = {
        koreanSentence: '나는 사과를 좋아해요',
        level: 'middle' as const,
      };
      mockGenerateKoreanSentence.mockResolvedValue(generateResult);
      mockEvaluateEnglishSentence.mockRejectedValue(new Error('API Error'));

      render(<SentenceWritingPage />);
      
      const generateButton = screen.getByRole('button', { name: '새 문장 생성' });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText('나는 사과를 좋아해요')).toBeInTheDocument();
      });

      const textarea = screen.getByPlaceholderText('여기에 영어 문장을 작성해주세요...');
      await user.type(textarea, 'I like apple');

      const evaluateButton = screen.getByRole('button', { name: /AI 평가/i });
      await user.click(evaluateButton);

      await waitFor(() => {
        expect(screen.getByText('API Error')).toBeInTheDocument();
      });
    });
  });
});

