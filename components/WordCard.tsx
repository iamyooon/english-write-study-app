/**
 * 단어 카드 컴포넌트 (드래그 가능)
 * 저학년용 Level 1 미션에서 사용
 */

'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

interface WordCardProps {
  id: string
  word: string
  isUsed?: boolean
  isDragging?: boolean
}

export default function WordCard({ id, word, isUsed = false, isDragging = false }: WordCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging: isDraggingState } = useDraggable({
    id,
    disabled: isUsed,
  })

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isUsed ? 0.4 : 1,
    cursor: isUsed ? 'not-allowed' : 'grab',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        px-6 py-4 rounded-xl font-bold text-lg
        bg-gradient-to-br from-indigo-100 to-purple-100
        border-2 border-indigo-300
        shadow-lg hover:shadow-xl
        transition-all duration-200
        select-none
        ${isUsed ? 'grayscale' : 'hover:scale-105 active:scale-95'}
        ${isDraggingState || isDragging ? 'z-50 scale-110 shadow-2xl' : ''}
        ${isUsed ? '' : 'hover:border-indigo-500'}
      `}
    >
      <span className="text-indigo-700">{word}</span>
      {isDraggingState && (
        <div className="absolute inset-0 bg-indigo-200 rounded-xl opacity-50 animate-pulse" />
      )}
    </div>
  )
}
