import React, { useState } from 'react';
import { SentenceService, Level, SentenceEvaluationResult } from '../services/SentenceService';
import { computeSentenceDiff, DiffSegment } from '../utils/diffUtils';

const SentenceWritingPage: React.FC = () => {
  const [level, setLevel] = useState<Level>('middle');
  const [koreanSentence, setKoreanSentence] = useState<string>('');
  const [userEnglish, setUserEnglish] = useState<string>('');
  const [evaluationResult, setEvaluationResult] = useState<SentenceEvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const levelOptions = [
    { value: 'elementary' as Level, label: '초등학교' },
    { value: 'middle' as Level, label: '중학교' },
    { value: 'high' as Level, label: '고등학교' },
  ];

  const handleGenerateSentence = async () => {
    setIsGenerating(true);
    setError(null);
    setKoreanSentence('');
    setUserEnglish('');
    setEvaluationResult(null);

    try {
      const result = await SentenceService.generateKoreanSentence(level);
      setKoreanSentence(result.koreanSentence);
    } catch (err) {
      let errorMessage = '문장 생성 중 오류가 발생했습니다.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      console.error('Sentence generation error:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEvaluate = async () => {
    if (!koreanSentence.trim()) {
      setError('먼저 한글 문장을 생성해주세요.');
      return;
    }

    if (!userEnglish.trim()) {
      setError('영어 문장을 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setEvaluationResult(null);

    try {
      const result = await SentenceService.evaluateEnglishSentence(
        koreanSentence,
        userEnglish,
        level
      );
      setEvaluationResult(result);
    } catch (err) {
      let errorMessage = '평가 중 오류가 발생했습니다.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      console.error('Evaluation error:', err);
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

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          영어 문장 쓰기
        </h1>

        {/* 수준 선택 */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            수준 선택
          </label>
          <div className="flex gap-4">
            {levelOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setLevel(option.value)}
                className={`px-6 py-3 rounded-lg font-medium transition-all ${
                  level === option.value
                    ? 'bg-indigo-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 한글 문장 생성 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              한글 문장
            </label>
            <button
              onClick={handleGenerateSentence}
              disabled={isGenerating}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? '생성 중...' : '새 문장 생성'}
            </button>
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 min-h-[80px] flex items-center">
            {koreanSentence ? (
              <p className="text-xl font-medium text-gray-800">{koreanSentence}</p>
            ) : (
              <p className="text-gray-400">"새 문장 생성" 버튼을 클릭하여 한글 문장을 받아보세요.</p>
            )}
          </div>
        </div>

        {/* 영어 문장 입력 */}
        <div className="space-y-2">
          <label htmlFor="english-textarea" className="block text-sm font-medium text-gray-700">
            위 한글 문장을 영어로 작성해보세요
          </label>
          <textarea
            id="english-textarea"
            value={userEnglish}
            onChange={(e) => setUserEnglish(e.target.value)}
            placeholder="여기에 영어 문장을 작성해주세요..."
            className="w-full h-32 p-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none text-gray-800 placeholder-gray-400"
            disabled={!koreanSentence}
          />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 평가 버튼 */}
        <div className="flex justify-center">
          <button
            onClick={handleEvaluate}
            disabled={isLoading || !koreanSentence || !userEnglish.trim()}
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
                평가 중...
              </span>
            ) : (
              'AI 평가 (Evaluate)'
            )}
          </button>
        </div>

        {/* 평가 결과 표시 */}
        {evaluationResult && (
          <div className="mt-8 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 border-b-2 border-indigo-200 pb-2">
              평가 결과
            </h2>

            {/* 점수 */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 rounded-lg border-2 border-indigo-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">점수</p>
                <p className={`text-5xl font-bold ${getScoreColor(evaluationResult.score)}`}>
                  {evaluationResult.score}점
                </p>
              </div>
            </div>

            {/* 한글 문장 */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">한글 문장</h3>
              <p className="text-gray-800 text-lg">{evaluationResult.koreanSentence}</p>
            </div>

            {/* 사용자 작성 문장 */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">작성한 영어 문장</h3>
              <p className="text-gray-800">{evaluationResult.userEnglish}</p>
            </div>

            {/* 정답 문장 */}
            <div className="bg-white p-4 rounded-lg border-2 border-indigo-200 shadow-sm">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                정답 문장 (수정된 부분 강조)
              </h3>
              <div className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                {renderDiff(computeSentenceDiff(evaluationResult.userEnglish, evaluationResult.correctEnglish))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 bg-red-100 border border-red-300 rounded"></span>
                  <span>수정이 필요한 부분</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-block w-4 h-4 bg-green-100 border border-green-300 rounded"></span>
                  <span>정답</span>
                </div>
              </div>
            </div>

            {/* 피드백 */}
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">💡 피드백</h3>
              <p className="text-gray-800 whitespace-pre-wrap">{evaluationResult.feedback}</p>
            </div>

            {/* 오류 목록 */}
            {evaluationResult.errors && evaluationResult.errors.length > 0 && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h3 className="text-sm font-medium text-gray-600 mb-3">❌ 발견된 오류</h3>
                <div className="space-y-3">
                  {evaluationResult.errors.map((error, index) => (
                    <div key={index} className="bg-white p-3 rounded border border-red-200">
                      <p className="font-medium text-red-800 mb-1">
                        {error.type}: {error.description}
                      </p>
                      <p className="text-sm text-gray-700">
                        💡 {error.suggestion}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SentenceWritingPage;

