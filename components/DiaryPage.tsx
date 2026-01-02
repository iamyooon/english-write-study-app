import React, { useState } from 'react';
import { GrammarService, GrammarCheckResult } from '../services/GrammarService';
import { computeSentenceDiff, DiffSegment } from '../utils/diffUtils';

const DiaryPage: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [checkResult, setCheckResult] = useState<GrammarCheckResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleCheckGrammar = async () => {
    if (!text.trim()) {
      setError('텍스트를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCheckResult(null);

    try {
      const result = await GrammarService.check(text);
      setCheckResult(result);
    } catch (err) {
      setError('문법 검사 중 오류가 발생했습니다.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const renderDiff = (segments: DiffSegment[]) => {
    return segments.map((segment, index) => {
      let className = 'inline';
      
      switch (segment.type) {
        case 'deleted':
          className = 'bg-red-100 text-red-800 line-through';
          break;
        case 'added':
          className = 'bg-green-100 text-green-800 font-semibold';
          break;
        case 'unchanged':
          className = 'text-gray-800';
          break;
      }

      return (
        <span key={index} className={className}>
          {segment.text}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          영어 일기 쓰기
        </h1>

        {/* 텍스트 입력 영역 */}
        <div className="space-y-2">
          <label htmlFor="diary-textarea" className="block text-sm font-medium text-gray-700">
            오늘의 일기를 작성해보세요
          </label>
          <textarea
            id="diary-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="여기에 영어 일기를 작성해주세요..."
            className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none text-gray-800 placeholder-gray-400"
          />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* AI 교정 버튼 */}
        <div className="flex justify-center">
          <button
            onClick={handleCheckGrammar}
            disabled={isLoading}
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                교정 중...
              </span>
            ) : (
              'AI 교정 (Check Grammar)'
            )}
          </button>
        </div>

        {/* 교정 결과 표시 */}
        {checkResult && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-indigo-200 pb-2">
              교정 결과
            </h2>

            {/* 원문 */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">원문</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{checkResult.original}</p>
            </div>

            {/* Diff 표시 */}
            <div className="bg-white p-4 rounded-lg border-2 border-indigo-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                교정문 (수정된 부분 강조)
              </h3>
              <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {renderDiff(computeSentenceDiff(checkResult.original, checkResult.corrected))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 bg-red-100 border border-red-300 rounded"></span>
                  <span>삭제된 부분</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 bg-green-100 border border-green-300 rounded"></span>
                  <span>추가/수정된 부분</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiaryPage;
