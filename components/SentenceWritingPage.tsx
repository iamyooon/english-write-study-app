import React, { useState, useEffect } from 'react';
import { SentenceEvaluationResult } from '@/services/SentenceService';
import { MissionService, Mission } from '@/services/MissionService';
import { createClient } from '@/lib/supabase/client';
import { computeSentenceDiff, DiffSegment } from '@/utils/diffUtils';

const SentenceWritingPage: React.FC = () => {
  const [grade, setGrade] = useState<number | null>(null); // 학년 (1-6) - null이면 선택 안됨
  const [currentMission, setCurrentMission] = useState<Mission | null>(null);
  const [currentMissionId, setCurrentMissionId] = useState<string | null>(null);
  const [koreanSentence, setKoreanSentence] = useState<string>('');
  const [userEnglish, setUserEnglish] = useState<string>('');
  const [evaluationResult, setEvaluationResult] = useState<SentenceEvaluationResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [blankInputs, setBlankInputs] = useState<string[]>([]);
  const [wordOrderOptions, setWordOrderOptions] = useState<string[]>([]);

  // 사용자 인증 확인 (학년은 자동 설정하지 않음 - 사용자가 직접 선택)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          setUserId(session.user.id);
          console.log('[SentenceWritingPage] 사용자 인증 확인:', session.user.id);
          console.log('[SentenceWritingPage] 학년 선택 화면 표시 - 사용자가 직접 선택해야 함');
          
          // URL 파라미터에서 placement_level이 있으면 무시 (리다이렉트 방지)
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.has('placement_level')) {
            console.log('[SentenceWritingPage] URL 파라미터 placement_level 발견, 무시하고 학년 선택 화면 표시');
            // URL에서 placement_level 파라미터 제거 (리다이렉트 방지)
            urlParams.delete('placement_level');
            const newUrl = window.location.pathname + (urlParams.toString() ? '?' + urlParams.toString() : '');
            window.history.replaceState({}, '', newUrl);
          }
        } else {
          console.log('[SentenceWritingPage] 로그인되지 않음 - 게스트 모드');
        }
      } catch (err) {
        console.error('[SentenceWritingPage] 인증 확인 오류:', err);
      }
    };
    checkAuth();
  }, []);

  const gradeOptions = [
    { value: 1, label: '1학년' },
    { value: 2, label: '2학년' },
    { value: 3, label: '3학년' },
    { value: 4, label: '4학년' },
    { value: 5, label: '5학년' },
    { value: 6, label: '6학년' },
  ];

  const resetMissionInputs = () => {
    setSelectedAnswers([]);
    setBlankInputs([]);
    setWordOrderOptions([]);
    setUserEnglish('');
    setEvaluationResult(null);
  };

  const normalizeText = (value: string) => value.trim().toLowerCase();

  const shuffleWords = (words: string[]) => {
    const result = [...words];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const getWordCounts = (words: string[]) =>
    words.reduce((counts, word) => {
      counts[word] = (counts[word] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

  const getTokensFromMission = (missionData: Mission['mission_data']) => {
    if (missionData.sentenceTokens && missionData.sentenceTokens.length > 0) {
      return missionData.sentenceTokens;
    }
    if (missionData.sentence) {
      return missionData.sentence.split(/\s+/);
    }
    return [];
  };

  const setupInputsForMission = (mission: Mission | null) => {
    if (!mission) return;

    if (mission.mission_type === 'drag_drop') {
      const blanks = mission.mission_data.blanks
        ?? mission.mission_data.correctAnswers?.length
        ?? 0;
      setSelectedAnswers(Array.from({ length: blanks }, () => ''));
      return;
    }

    if (mission.mission_type === 'keyboard' && mission.mission_data.sub_type === 'blank_fill') {
      const blanks = mission.mission_data.blanks
        ?? mission.mission_data.correctAnswers?.length
        ?? 0;
      setBlankInputs(Array.from({ length: blanks }, () => ''));
    }

    if (mission.mission_type === 'keyboard' && mission.mission_data.sub_type === 'word_order') {
      const tokens = getTokensFromMission(mission.mission_data);
      setSelectedAnswers(Array.from({ length: tokens.length }, () => ''));
      setWordOrderOptions(shuffleWords(tokens));
    }
  };

  const fillTemplate = (template: string, answers: string[]) => {
    let result = template;
    answers.forEach((answer) => {
      result = result.replace('___', answer || '___');
    });
    return result;
  };

  const buildLocalEvaluation = (
    userAnswer: string,
    correctAnswer: string,
    score: number,
    feedback: string
  ): SentenceEvaluationResult => ({
    koreanSentence,
    userEnglish: userAnswer,
    correctEnglish: correctAnswer,
    score,
    feedback,
    errors: []
  });

  const evaluateByCorrectAnswers = (
    correctAnswers: string[],
    userAnswers: string[],
    template?: string
  ) => {
    const normalizedCorrect = correctAnswers.map(normalizeText);
    const normalizedUser = userAnswers.map(normalizeText);
    const total = Math.max(1, normalizedCorrect.length);
    const correctCount = normalizedCorrect.reduce((count, answer, index) => {
      return count + (answer === normalizedUser[index] ? 1 : 0);
    }, 0);
    const score = Math.round((correctCount / total) * 100);
    const userAnswerText = template ? fillTemplate(template, userAnswers) : userAnswers.join(' ');
    const correctAnswerText = template ? fillTemplate(template, correctAnswers) : correctAnswers.join(' ');
    const feedback = score === 100
      ? '정답입니다! 잘했어요.'
      : `정답은 "${correctAnswerText}" 입니다.`;
    return buildLocalEvaluation(userAnswerText, correctAnswerText, score, feedback);
  };

  const handleSelectAnswer = (word: string) => {
    const nextIndex = selectedAnswers.findIndex((answer) => !answer);
    if (nextIndex === -1) return;
    const updated = [...selectedAnswers];
    updated[nextIndex] = word;
    setSelectedAnswers(updated);
  };

  const handleRemoveAnswer = (index: number) => {
    const updated = [...selectedAnswers];
    updated[index] = '';
    setSelectedAnswers(updated);
  };

  const handleBlankInputChange = (index: number, value: string) => {
    const updated = [...blankInputs];
    updated[index] = value;
    setBlankInputs(updated);
  };

  const handleResetAnswers = () => {
    resetMissionInputs();
    setupInputsForMission(currentMission);
  };

  const renderTemplateWithSlots = (template: string) => {
    const parts = template.split('___');
    return (
      <span>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <span>{part}</span>
            {index < selectedAnswers.length && (
              <button
                type="button"
                onClick={() => handleRemoveAnswer(index)}
                className={`inline-flex items-center justify-center min-w-[64px] px-2 py-1 mx-1 border rounded ${
                  selectedAnswers[index]
                    ? 'bg-indigo-100 border-indigo-300 text-indigo-800'
                    : 'bg-white border-gray-300 text-gray-400'
                }`}
              >
                {selectedAnswers[index] || '___'}
              </button>
            )}
          </React.Fragment>
        ))}
      </span>
    );
  };

  const handleGenerateMission = async () => {
    // 학년이 선택되지 않았으면 에러
    if (grade === null) {
      setError('먼저 학년을 선택해주세요.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setKoreanSentence('');
    resetMissionInputs();
    setCurrentMission(null);
    setCurrentMissionId(null);

    try {
      console.log('[SentenceWritingPage] 미션 생성 시작:', { grade, userId });

      const mission = await MissionService.getMission(userId, grade);

      if (!mission) {
        setError('사용 가능한 미션이 없습니다. 모든 미션을 완료하셨거나 미션이 준비되지 않았습니다.');
        return;
      }

      console.log('[SentenceWritingPage] 미션 조회 성공:', mission);

      setCurrentMission(mission);
      setCurrentMissionId(mission.id);
      setKoreanSentence(mission.mission_data.korean);
      setupInputsForMission(mission);
    } catch (err) {
      let errorMessage = '미션 생성 중 오류가 발생했습니다.';
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setError(errorMessage);
      console.error('[SentenceWritingPage] 미션 생성 오류:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEvaluate = async () => {
    if (!koreanSentence.trim() || !currentMission) {
      setError('먼저 미션을 생성해주세요.');
      return;
    }

    const missionData = currentMission.mission_data;
    const subType = missionData.sub_type;
    const expectedSentence = missionData.example || missionData.sentence || '';

    setIsLoading(true);
    setError(null);
    setEvaluationResult(null);

    try {
      let localResult: SentenceEvaluationResult | null = null;

      if (currentMission.mission_type === 'drag_drop') {
        const answers = selectedAnswers;
        if (answers.some((answer) => !answer.trim())) {
          setError('빈칸을 모두 채워주세요.');
          return;
        }
        const correctAnswers = missionData.correctAnswers || [];
        const result = evaluateByCorrectAnswers(
          correctAnswers,
          answers,
          missionData.template
        );
        setEvaluationResult(result);
        localResult = result;
      } else if (subType === 'word_order') {
        const answers = selectedAnswers;
        if (answers.some((answer) => !answer.trim())) {
          setError('단어를 모두 선택해주세요.');
          return;
        }
        const correctAnswers = getTokensFromMission(missionData);
        const result = evaluateByCorrectAnswers(correctAnswers, answers);
        setEvaluationResult(result);
        localResult = result;
      } else if (subType === 'blank_fill') {
        if (blankInputs.some((answer) => !answer.trim())) {
          setError('빈칸을 모두 입력해주세요.');
          return;
        }
        const correctAnswers = missionData.correctAnswers || [];
        const result = evaluateByCorrectAnswers(
          correctAnswers,
          blankInputs,
          missionData.template
        );
        setEvaluationResult(result);
        localResult = result;
      } else {
        if (!userEnglish.trim()) {
          setError('영어 문장을 입력해주세요.');
          return;
        }
        if (!expectedSentence) {
          setError('정답 문장이 준비되지 않았습니다.');
          return;
        }

        const expectedTokens = expectedSentence.split(/\s+/);
        const userTokens = userEnglish.trim().split(/\s+/);
        const total = Math.max(1, expectedTokens.length);
        const correctCount = expectedTokens.reduce((count, token, index) => {
          return count + (normalizeText(token) === normalizeText(userTokens[index] || '') ? 1 : 0);
        }, 0);
        const score = Math.round((correctCount / total) * 100);
        const feedback = score === 100
          ? '정확합니다! 잘했어요.'
          : `정답 문장은 "${expectedSentence}" 입니다.`;
        const result = buildLocalEvaluation(userEnglish, expectedSentence, score, feedback);
        setEvaluationResult(result);
        localResult = result;
      }

      if (userId && currentMissionId) {
        try {
          const scoreToSave = localResult?.score ?? 0;
          await MissionService.recordMissionProgress(userId, currentMissionId, scoreToSave);
          console.log('[SentenceWritingPage] 미션 완료 기록 성공');
        } catch (progressError) {
          console.error('[SentenceWritingPage] 미션 완료 기록 오류:', progressError);
        }
      }
    } catch (err) {
      let errorMessage = '평가 중 오류가 발생했습니다.';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      setError(errorMessage);
      console.error('[SentenceWritingPage] 평가 오류:', err);
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

  const missionSubTypeLabels: Record<string, string> = {
    word_bank_fill: '단어 끼워넣기',
    word_order: '문장 순서 배열',
    blank_fill: '빈칸 채우기',
    sentence_write: '문장 쓰기',
    copy_typing: '따라 쓰기',
    dictation: '받아쓰기'
  };

  const missionSubType = currentMission?.mission_data.sub_type;
  const isDragDropMission = currentMission?.mission_type === 'drag_drop';
  const isBlankFillMission = missionSubType === 'blank_fill';
  const isWordOrderMission = missionSubType === 'word_order';
  const shouldShowTextArea = !isDragDropMission && !isBlankFillMission && !isWordOrderMission;

  const missionSubTypeLabel = missionSubType
    ? (missionSubTypeLabels[missionSubType] ?? missionSubType)
    : null;
  const missionTypeLabel = currentMission
    ? (isDragDropMission ? 'Drag & Drop' : '키보드 입력')
    : null;
  const missionWord = currentMission?.mission_data.word;
  const missionDifficulty = currentMission?.mission_data.difficultyTier;
  const sentenceTokenCount = currentMission?.mission_data.sentenceTokens?.length;

  const missionInstruction = (() => {
    if (!currentMission) return '';
    if (isDragDropMission) {
      return '단어 카드를 눌러 빈칸을 채우세요. 선택한 단어를 다시 클릭하면 제거됩니다.';
    }
    if (isWordOrderMission) {
      return '단어 카드를 순서대로 선택해 문장을 완성하세요. 선택한 단어를 클릭하면 제거됩니다.';
    }
    if (isBlankFillMission) {
      return '빈칸에 알맞은 단어를 입력하세요. 철자와 대소문자를 확인하세요.';
    }
    if (missionSubType === 'copy_typing') {
      return '예문을 그대로 따라 적어보세요.';
    }
    if (missionSubType === 'dictation') {
      return '받아쓰기 미션입니다. 들은 내용을 정확히 입력하세요.';
    }
    return '한글 문장을 영어로 작성해보세요.';
  })();

  const isAnswerReady = isDragDropMission || isWordOrderMission
    ? selectedAnswers.length > 0 && selectedAnswers.every((answer) => answer.trim())
    : isBlankFillMission
      ? blankInputs.length > 0 && blankInputs.every((answer) => answer.trim())
      : userEnglish.trim().length > 0;

  const canSelectMore = selectedAnswers.some((answer) => !answer);
  const selectedCounts = getWordCounts(selectedAnswers.filter((answer) => answer));
  const dragDropOptions = currentMission?.mission_data.wordOptions || [];
  const dragDropOptionCounts = getWordCounts(dragDropOptions);
  const wordOrderOptionCounts = getWordCounts(wordOrderOptions);
  const canResetAnswers = Boolean(
    currentMission
      && (
        selectedAnswers.some((answer) => answer.trim())
        || blankInputs.some((answer) => answer.trim())
        || userEnglish.trim()
        || evaluationResult
      )
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">
          영어 문장 쓰기
        </h1>

        {/* 학년 선택 - 항상 표시 */}
        <div className="space-y-3 bg-indigo-50 p-4 rounded-lg border-2 border-indigo-200">
          <label className="block text-base font-semibold text-gray-800">
            📚 학년 선택
          </label>
          <div className="flex gap-2 flex-wrap">
            {gradeOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  console.log('[SentenceWritingPage] 학년 선택:', option.value);
                  setGrade(option.value);
                  setCurrentMission(null);
                  setKoreanSentence('');
                  resetMissionInputs();
                }}
                className={`px-5 py-3 rounded-lg font-semibold transition-all text-sm shadow-md ${
                  grade === option.value
                    ? 'bg-indigo-600 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 hover:bg-indigo-100 hover:shadow-lg'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="text-sm text-indigo-700 mt-2 font-medium">
            {grade === null 
              ? '👆 위에서 학년을 선택해주세요' 
              : '🎯 학년에 맞는 다양한 미션을 제공합니다'}
          </p>
        </div>

        {/* 한글 문장 생성 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              한글 문장
            </label>
            <button
              onClick={handleGenerateMission}
              disabled={isGenerating || grade === null}
              className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? '미션 생성 중...' : grade === null ? '학년을 먼저 선택하세요' : '새 미션 생성'}
            </button>
          </div>
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 min-h-[80px] flex items-center">
            {koreanSentence ? (
              <div>
                <p className="text-xl font-medium text-gray-800 mb-2">{koreanSentence}</p>
                {currentMission && (
                  <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-2">
                    {currentMission.unit && (
                      <span className="inline-block bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                        Unit {currentMission.unit}{currentMission.order_in_unit ? ` · ${currentMission.order_in_unit}번째` : ''}: {currentMission.topic || ''}
                      </span>
                    )}
                    {missionTypeLabel && (
                      <span className="inline-block bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {missionTypeLabel}
                      </span>
                    )}
                    {missionSubTypeLabel && (
                      <span className="inline-block bg-amber-100 text-amber-700 px-2 py-1 rounded">
                        {missionSubTypeLabel}
                      </span>
                    )}
                    {typeof missionDifficulty === 'number' && (
                      <span className="inline-block bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        난이도 Tier {missionDifficulty}
                      </span>
                    )}
                    {missionWord && (
                      <span className="inline-block bg-emerald-100 text-emerald-700 px-2 py-1 rounded">
                        핵심 단어: {missionWord}
                      </span>
                    )}
                    {sentenceTokenCount && (
                      <span className="inline-block bg-slate-100 text-slate-600 px-2 py-1 rounded">
                        단어 수: {sentenceTokenCount}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400">"새 미션 생성" 버튼을 클릭하여 미션을 받아보세요.</p>
            )}
          </div>
        </div>

        {currentMission && (
          <div className="bg-indigo-50 border border-indigo-200 text-indigo-800 px-4 py-3 rounded-lg text-sm">
            {missionInstruction}
          </div>
        )}

        {/* Drag & Drop 미션 */}
        {isDragDropMission && currentMission?.mission_data?.template && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              단어를 끼워 넣어 문장을 완성하세요
            </label>
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 text-gray-800">
              {renderTemplateWithSlots(currentMission.mission_data.template)}
            </div>
            <div className="flex flex-wrap gap-2">
              {dragDropOptions.map((word, index) => {
                const isUsedUp =
                  (selectedCounts[word] ?? 0) >= (dragDropOptionCounts[word] ?? 0)
                  || !canSelectMore;
                return (
                  <button
                    key={`${word}-${index}`}
                    type="button"
                    onClick={() => handleSelectAnswer(word)}
                    disabled={isUsedUp}
                    className={`px-3 py-2 border rounded-lg text-sm transition-all ${
                      isUsedUp
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 빈칸 채우기 (키보드) */}
        {isBlankFillMission && currentMission?.mission_data?.template && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              빈칸을 입력해 문장을 완성하세요
            </label>
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 text-gray-800">
              {currentMission.mission_data.template}
            </div>
            <div className="flex flex-wrap gap-2">
              {blankInputs.map((value, index) => (
                <input
                  key={index}
                  value={value}
                  onChange={(e) => handleBlankInputChange(index, e.target.value)}
                  placeholder={`빈칸 ${index + 1}`}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              ))}
            </div>
          </div>
        )}

        {/* 문장 순서 배열 */}
        {isWordOrderMission && (
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              단어 카드를 순서대로 선택해 문장을 완성하세요
            </label>
            <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 min-h-[72px]">
              {selectedAnswers.some((answer) => answer.trim()) ? (
                <div className="flex flex-wrap gap-2">
                  {selectedAnswers.map((word, index) => (
                    <button
                      key={`${word}-${index}`}
                      type="button"
                      onClick={() => handleRemoveAnswer(index)}
                      className={`px-3 py-2 rounded-lg text-sm border ${
                        word
                          ? 'bg-indigo-100 border-indigo-200 text-indigo-800'
                          : 'bg-white border-gray-200 text-gray-300'
                      }`}
                    >
                      {word || '___'}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">단어를 선택해 문장을 만들어보세요.</p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {wordOrderOptions.map((word, index) => {
                const isUsedUp =
                  (selectedCounts[word] ?? 0) >= (wordOrderOptionCounts[word] ?? 0)
                  || !canSelectMore;
                return (
                  <button
                    key={`${word}-${index}`}
                    type="button"
                    onClick={() => handleSelectAnswer(word)}
                    disabled={isUsedUp}
                    className={`px-3 py-2 border rounded-lg text-sm transition-all ${
                      isUsedUp
                        ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-white border-indigo-200 text-indigo-700 hover:bg-indigo-50'
                    }`}
                  >
                    {word}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* 문장 입력 */}
        {shouldShowTextArea && (
          <div className="space-y-2">
            <label htmlFor="english-textarea" className="block text-sm font-medium text-gray-700">
              위 한글 문장을 영어로 작성해보세요
            </label>
            {currentMission?.mission_data?.vocabulary && (
              <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                {currentMission.mission_data.vocabulary.map((word) => (
                  <span key={word} className="px-2 py-1 bg-gray-100 rounded">
                    {word}
                  </span>
                ))}
              </div>
            )}
            {missionSubType === 'copy_typing' && currentMission?.mission_data?.example && (
              <p className="text-sm text-indigo-600">
                예문을 그대로 따라 적어보세요: {currentMission.mission_data.example}
              </p>
            )}
            <textarea
              id="english-textarea"
              value={userEnglish}
              onChange={(e) => setUserEnglish(e.target.value)}
              placeholder="여기에 영어 문장을 작성해주세요..."
              className="w-full h-32 p-4 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none text-gray-800 placeholder-gray-400"
              disabled={!koreanSentence}
            />
          </div>
        )}

        {/* 에러 메시지 */}
        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* 평가 버튼 */}
        <div className="flex justify-center gap-3">
          <button
            onClick={handleResetAnswers}
            disabled={!canResetAnswers || isLoading || isGenerating}
            className="px-5 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all"
          >
            답안 초기화
          </button>
          <button
            onClick={handleEvaluate}
            disabled={isLoading || !koreanSentence || !isAnswerReady}
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
              '정답 확인'
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

            <div className="flex justify-center pt-2">
              <button
                onClick={handleGenerateMission}
                disabled={isGenerating}
                className="px-6 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:bg-emerald-300 disabled:cursor-not-allowed transition-all"
              >
                {isGenerating ? '다음 미션 불러오는 중...' : '다음 미션 도전하기'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SentenceWritingPage;
