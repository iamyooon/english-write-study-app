/**
 * 저학년용 클릭 방식 미션 컴포넌트
 * Level 1-2: 단어 카드를 클릭하여 문장 완성
 */

'use client'

import { useState, useEffect } from 'react'
import React from 'react'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

interface Mission {
  id: string
  korean: string
  template: string // "Hello, my name is ___"
  blanks: number // 빈칸 개수
  wordOptions: string[] // 선택 가능한 단어들
  correctAnswers: string[] // 정답 (순서대로)
  level: number
}

interface DragDropMissionProps {
  mission: Mission
  onComplete?: (isCorrect: boolean, userAnswer: string[]) => void
}

export default function DragDropMission({ mission, onComplete }: DragDropMissionProps) {
  const [selectedWords, setSelectedWords] = useState<{ [key: string]: string | null }>({})
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState<{ [key: string]: boolean }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 미션이 변경되면 상태 초기화
  useEffect(() => {
    setSelectedWords({})
    setIsSubmitted(false)
    setIsCorrect({})
  }, [mission.id, mission.wordOptions])

  // 빈칸 ID 생성
  const blankIds = Array.from({ length: mission.blanks }, (_, i) => `blank-${i}`)

  // 단어가 선택되었는지 확인하는 헬퍼 함수
  const isWordSelected = (word: string): boolean => {
    return Object.values(selectedWords).includes(word)
  }

  // 단어 카드 클릭 핸들러
  const handleWordClick = (word: string) => {
    console.log('[DragDrop] 단어 클릭:', { word, isSubmitted, selectedWords })
    if (isSubmitted) {
      console.log('[DragDrop] 이미 제출됨, 무시')
      return
    }

    // 이미 선택된 단어인지 확인 (빈칸에 있는 단어)
    const isAlreadySelected = isWordSelected(word)
    console.log('[DragDrop] 단어 선택 상태:', { isAlreadySelected })
    
    if (isAlreadySelected) {
      // 이미 선택된 단어를 다시 클릭하면 취소
      const blankId = Object.keys(selectedWords).find(id => selectedWords[id] === word)
      console.log('[DragDrop] 단어 선택 취소:', { blankId })
      if (blankId) {
        setSelectedWords(prev => ({
          ...prev,
          [blankId]: null,
        }))
      }
      return
    }

    // 다음 빈칸 찾기
    const nextBlankId = blankIds.find(id => !selectedWords[id])
    if (!nextBlankId) {
      console.log('[DragDrop] 모든 빈칸 채워짐')
      toast.error('모든 빈칸이 채워졌습니다!')
      return
    }

    console.log('[DragDrop] 단어를 빈칸에 배치:', { word, blankId: nextBlankId })
    // 단어를 빈칸에 배치
    setSelectedWords(prev => ({
      ...prev,
      [nextBlankId]: word,
    }))
  }

  // 빈칸의 단어 클릭 핸들러 (취소)
  const handleBlankWordClick = (blankId: string) => {
    console.log('[DragDrop] 빈칸 클릭:', { blankId, isSubmitted })
    if (isSubmitted) {
      console.log('[DragDrop] 이미 제출됨, 무시')
      return
    }

    const word = selectedWords[blankId]
    if (!word) {
      console.log('[DragDrop] 빈칸에 단어 없음')
      return
    }

    console.log('[DragDrop] 빈칸 비우기:', { blankId, word })
    // 빈칸 비우기
    setSelectedWords(prev => ({
      ...prev,
      [blankId]: null,
    }))
  }

  // 제출
  const handleSubmit = async () => {
    console.log('[DragDrop] 제출 시작:', { isSubmitted, selectedWords })
    if (blankIds.some(id => !selectedWords[id])) {
      console.log('[DragDrop] 모든 빈칸 채우지 않음')
      toast.error('모든 빈칸을 채워주세요!')
      return
    }

    setIsSubmitting(true)

    // 정답 확인
    const userAnswers = blankIds.map(id => selectedWords[id] || '')
    const correct = userAnswers.every((answer, idx) => answer === mission.correctAnswers[idx])
    console.log('[DragDrop] 정답 확인:', { 
      userAnswers, 
      correctAnswers: mission.correctAnswers, 
      correct 
    })
    
    // 각 빈칸의 정답 여부 확인
    const correctness: { [key: string]: boolean } = {}
    blankIds.forEach((id, idx) => {
      correctness[id] = userAnswers[idx] === mission.correctAnswers[idx]
    })
    console.log('[DragDrop] 각 빈칸 정답 여부:', correctness)
    setIsCorrect(correctness)
    setIsSubmitted(true)

    // 결과를 서버에 전송
    try {
      console.log('[DragDrop] 서버 전송 시작')
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        const userAnswer = userAnswers.join(' ')
        const fullSentence = mission.template.replace(/___/g, (_, idx) => userAnswers[idx] || '___')
        console.log('[DragDrop] 서버 전송 데이터:', { 
          missionId: mission.id, 
          userAnswer, 
          fullSentence, 
          isCorrect: correct 
        })

        const response = await fetch('/api/study/drag-drop-submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            missionId: mission.id,
            userAnswer,
            fullSentence,
            isCorrect: correct,
            level: mission.level,
          }),
        })
        
        if (!response.ok) {
          const error = await response.json()
          console.error('[DragDrop] 서버 응답 오류:', error)
          throw new Error(error.error || '제출 실패')
        }
        
        const data = await response.json()
        console.log('[DragDrop] 서버 응답 성공:', data)
      } else {
        console.log('[DragDrop] 세션 없음, 서버 전송 건너뜀')
      }

      // 메시지는 onComplete에서 처리하므로 여기서는 제거 (중복 방지)
      console.log('[DragDrop] onComplete 호출:', { correct, userAnswers })
      onComplete?.(correct, userAnswers)
    } catch (error) {
      console.error('[DragDrop] 제출 오류:', error)
      toast.error('제출 중 오류가 발생했습니다.')
    } finally {
      console.log('[DragDrop] 제출 완료')
      setIsSubmitting(false)
    }
  }

  // 다시 시도
  const handleRetry = () => {
    setSelectedWords({})
    setIsSubmitted(false)
    setIsCorrect({})
  }

  // 문장 템플릿 렌더링
  const renderSentence = () => {
    const parts = mission.template.split('___')
    return (
      <div className="flex items-center justify-center flex-nowrap gap-x-1 text-2xl font-bold text-gray-800">
        {parts.map((part, idx) => (
          <React.Fragment key={idx}>
            {part && (
              <span className="whitespace-pre">{part}</span>
            )}
            {idx < parts.length - 1 && (
              <button
                onClick={() => handleBlankWordClick(blankIds[idx])}
                disabled={isSubmitted}
                className={`
                  inline-flex items-center justify-center
                  min-w-[90px] h-[45px]
                  px-2 py-1 rounded-md
                  border-2 border-dashed
                  transition-all duration-200
                  shrink-0
                  ${!selectedWords[blankIds[idx]]
                    ? 'bg-gray-50 border-gray-300 hover:bg-gray-100 hover:border-gray-400'
                    : isCorrect[blankIds[idx]]
                      ? 'bg-green-50 border-green-400 hover:bg-green-100'
                      : 'bg-yellow-50 border-yellow-400 hover:bg-yellow-100'
                  }
                  ${isSubmitted ? 'cursor-default' : 'cursor-pointer'}
                `}
              >
                {selectedWords[blankIds[idx]] ? (
                  <span className={`
                    font-bold text-base whitespace-nowrap
                    ${isCorrect[blankIds[idx]] ? 'text-green-600' : 'text-red-600'}
                  `}>
                    {selectedWords[blankIds[idx]]}
                  </span>
                ) : (
                  <span className="text-gray-400 text-xs whitespace-nowrap">빈칸</span>
                )}
              </button>
            )}
          </React.Fragment>
        ))}
      </div>
    )
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8">
      {/* 미션 설명 */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-800">{mission.korean}</h2>
        <p className="text-gray-600">단어 카드를 클릭해서 문장을 완성해보세요!</p>
        <p className="text-sm text-gray-500">선택한 단어를 다시 클릭하면 취소됩니다</p>
      </div>

      {/* 문장 템플릿 */}
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="flex justify-center items-center min-h-[120px]">
          {renderSentence()}
        </div>
      </div>

      {/* 단어 카드 영역 */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-700 mb-4 text-center">
          단어 카드를 클릭하세요
        </h3>
        <div className="flex flex-wrap gap-4 justify-center">
          {mission.wordOptions.map((word: string, idx: number) => {
            const isSelected = isWordSelected(word)
            return (
              <button
                key={`word-${idx}`}
                onClick={() => handleWordClick(word)}
                disabled={isSubmitted}
                className={`
                  px-6 py-4 rounded-xl font-bold text-lg
                  border-2
                  shadow-lg
                  transition-all duration-200
                  select-none
                  ${isSubmitted 
                    ? 'opacity-50 cursor-not-allowed bg-gray-200 border-gray-300' 
                    : isSelected
                      ? 'opacity-60 grayscale bg-gray-200 border-gray-400 cursor-pointer hover:opacity-80 hover:grayscale-0'
                      : 'bg-gradient-to-br from-indigo-100 to-purple-100 border-indigo-300 hover:shadow-xl hover:scale-105 active:scale-95 hover:border-indigo-500 cursor-pointer'
                  }
                `}
                title={isSelected ? '클릭하여 선택 취소' : '클릭하여 선택'}
              >
                <span className={isSelected ? 'text-gray-600 line-through' : 'text-indigo-700'}>
                  {word}
                </span>
                {isSelected && (
                  <span className="ml-2 text-xs">✓</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* 제출 버튼 */}
      <div className="flex justify-center gap-4">
        {!isSubmitted ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || blankIds.some(id => !selectedWords[id])}
            className={`
              px-8 py-4 rounded-xl font-bold text-lg
              transition-all duration-200
              ${blankIds.some(id => !selectedWords[id]) || isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105'
              }
            `}
          >
            {isSubmitting ? '제출 중...' : '제출하기 ✨'}
          </button>
        ) : (
          <button
            onClick={handleRetry}
            className="px-8 py-4 rounded-xl font-bold text-lg bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            다시 해보기 🔄
          </button>
        )}
      </div>
    </div>
  )
}
