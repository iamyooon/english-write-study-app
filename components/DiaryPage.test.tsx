import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DiaryPage from './DiaryPage';
import { GrammarService } from '../services/GrammarService';

// GrammarService를 mock
vi.mock('../services/GrammarService', () => ({
  GrammarService: {
    check: vi.fn(),
  },
}));

describe('DiaryPage', () => {
  const mockCheck = vi.mocked(GrammarService.check);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('초기 렌더링', () => {
    it('컴포넌트가 정상적으로 렌더링된다', () => {
      render(<DiaryPage />);
      
      expect(screen.getByText('영어 일기 쓰기')).toBeInTheDocument();
      expect(screen.getByLabelText('오늘의 일기를 작성해보세요')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /AI 교정/i })).toBeInTheDocument();
    });

    it('초기 상태에서 textarea가 비어있다', () => {
      render(<DiaryPage />);
      
      const textarea = screen.getByLabelText('오늘의 일기를 작성해보세요');
      expect(textarea).toHaveValue('');
    });

    it('초기 상태에서 교정 결과가 표시되지 않는다', () => {
      render(<DiaryPage />);
      
      expect(screen.queryByText('교정 결과')).not.toBeInTheDocument();
    });
  });

  describe('입력 기능', () => {
    it('textarea에 텍스트를 입력할 수 있다', async () => {
      const user = userEvent.setup();
      render(<DiaryPage />);
      
      const textarea = screen.getByLabelText('오늘의 일기를 작성해보세요');
      await user.type(textarea, 'Hello world');
      
      expect(textarea).toHaveValue('Hello world');
    });
  });

  describe('입력값 검증', () => {
    it('입력값이 없을 때 버튼을 클릭하면 경고 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      render(<DiaryPage />);
      
      const button = screen.getByRole('button', { name: /AI 교정/i });
      await user.click(button);
      
      expect(screen.getByText('텍스트를 입력해주세요.')).toBeInTheDocument();
      expect(mockCheck).not.toHaveBeenCalled();
    });

    it('공백만 입력된 경우에도 경고 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      render(<DiaryPage />);
      
      const textarea = screen.getByLabelText('오늘의 일기를 작성해보세요');
      await user.type(textarea, '   ');
      
      const button = screen.getByRole('button', { name: /AI 교정/i });
      await user.click(button);
      
      expect(screen.getByText('텍스트를 입력해주세요.')).toBeInTheDocument();
      expect(mockCheck).not.toHaveBeenCalled();
    });

    it('텍스트 입력 후 공백만 남은 경우에도 경고 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      render(<DiaryPage />);
      
      const textarea = screen.getByLabelText('오늘의 일기를 작성해보세요');
      await user.type(textarea, 'Hello');
      await user.clear(textarea);
      await user.type(textarea, '   ');
      
      const button = screen.getByRole('button', { name: /AI 교정/i });
      await user.click(button);
      
      expect(screen.getByText('텍스트를 입력해주세요.')).toBeInTheDocument();
      expect(mockCheck).not.toHaveBeenCalled();
    });
  });

  describe('AI 교정 기능', () => {
    it('유효한 텍스트가 있을 때 버튼을 클릭하면 GrammarService.check가 호출된다', async () => {
      const user = userEvent.setup();
      const mockResult = {
        original: 'i like apple',
        corrected: 'I like apple',
      };
      mockCheck.mockResolvedValue(mockResult);

      render(<DiaryPage />);
      
      const textarea = screen.getByLabelText('오늘의 일기를 작성해보세요');
      await user.type(textarea, 'i like apple');
      
      const button = screen.getByRole('button', { name: /AI 교정/i });
      await user.click(button);
      
      expect(mockCheck).toHaveBeenCalledWith('i like apple');
      expect(mockCheck).toHaveBeenCalledTimes(1);
    });

    it('로딩 중일 때 버튼이 비활성화되고 로딩 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      const mockResult = {
        original: 'i like apple',
        corrected: 'I like apple',
      };
      // Promise를 즉시 resolve하지 않도록 지연
      mockCheck.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(mockResult), 100)));

      render(<DiaryPage />);
      
      const textarea = screen.getByLabelText('오늘의 일기를 작성해보세요');
      await user.type(textarea, 'i like apple');
      
      const button = screen.getByRole('button', { name: /AI 교정/i });
      await user.click(button);
      
      // 로딩 중에는 버튼이 비활성화됨
      expect(button).toBeDisabled();
      expect(screen.getByText('교정 중...')).toBeInTheDocument();
    });

    it('교정 결과가 성공적으로 표시된다', async () => {
      const user = userEvent.setup();
      const mockResult = {
        original: 'i like apple',
        corrected: 'I like apple',
      };
      mockCheck.mockResolvedValue(mockResult);

      render(<DiaryPage />);
      
      const textarea = screen.getByLabelText('오늘의 일기를 작성해보세요');
      await user.type(textarea, 'i like apple');
      
      const button = screen.getByRole('button', { name: /AI 교정/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('교정 결과')).toBeInTheDocument();
      });
      
      expect(screen.getByText('원문')).toBeInTheDocument();
      // 원문 섹션 내에서 텍스트 찾기 (textarea와 구분하기 위해)
      const originalSection = screen.getByText('원문').closest('div');
      expect(originalSection).toHaveTextContent('i like apple');
      expect(screen.getByText('교정문 (수정된 부분 강조)')).toBeInTheDocument();
    });

    it('교정 중 에러가 발생하면 에러 메시지가 표시된다', async () => {
      const user = userEvent.setup();
      mockCheck.mockRejectedValue(new Error('API Error'));

      render(<DiaryPage />);
      
      const textarea = screen.getByLabelText('오늘의 일기를 작성해보세요');
      await user.type(textarea, 'i like apple');
      
      const button = screen.getByRole('button', { name: /AI 교정/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('문법 검사 중 오류가 발생했습니다.')).toBeInTheDocument();
      });
    });

    it('이전 에러 메시지가 있을 때 새로운 교정 요청 시 에러가 사라진다', async () => {
      const user = userEvent.setup();
      const mockResult = {
        original: 'i like apple',
        corrected: 'I like apple',
      };

      // 첫 번째: 에러 발생
      mockCheck.mockRejectedValueOnce(new Error('API Error'));
      render(<DiaryPage />);
      
      const textarea = screen.getByLabelText('오늘의 일기를 작성해보세요');
      await user.type(textarea, 'i like apple');
      
      const button = screen.getByRole('button', { name: /AI 교정/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('문법 검사 중 오류가 발생했습니다.')).toBeInTheDocument();
      });

      // 두 번째: 성공
      mockCheck.mockResolvedValueOnce(mockResult);
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.queryByText('문법 검사 중 오류가 발생했습니다.')).not.toBeInTheDocument();
      });
    });
  });

  describe('교정 결과 표시', () => {
    it('원문과 교정문이 모두 표시된다', async () => {
      const user = userEvent.setup();
      const mockResult = {
        original: 'i can\'t do it',
        corrected: 'I cannot do it',
      };
      mockCheck.mockResolvedValue(mockResult);

      render(<DiaryPage />);
      
      const textarea = screen.getByLabelText('오늘의 일기를 작성해보세요');
      await user.type(textarea, mockResult.original);
      
      const button = screen.getByRole('button', { name: /AI 교정/i });
      await user.click(button);
      
      await waitFor(() => {
        expect(screen.getByText('교정 결과')).toBeInTheDocument();
      });
      
      // 원문 확인
      const originalSection = screen.getByText('원문').closest('div');
      expect(originalSection).toHaveTextContent('i can\'t do it');
      
      // Diff 표시 영역이 존재하는지 확인
      expect(screen.getByText('교정문 (수정된 부분 강조)')).toBeInTheDocument();
    });
  });
});
