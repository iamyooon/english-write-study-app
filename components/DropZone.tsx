/**
 * 드롭 영역 컴포넌트 (문장 빈칸)
 * 저학년용 Level 1 미션에서 사용
 */

'use client'

import { useDroppable } from '@dnd-kit/core'
import { ReactNode } from 'react'

interface DropZoneProps {
  id: string
  children: ReactNode
  isEmpty?: boolean
  isCorrect?: boolean
  className?: string
}

export default function DropZone({ 
  id, 
  children, 
  isEmpty = true, 
  isCorrect = false,
  className = '' 
}: DropZoneProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`
        min-w-[120px] min-h-[60px]
        px-4 py-3 rounded-lg
        border-2 border-dashed
        flex items-center justify-center
        transition-all duration-200
        ${isEmpty 
          ? 'bg-gray-50 border-gray-300' 
          : isCorrect 
            ? 'bg-green-50 border-green-400' 
            : 'bg-yellow-50 border-yellow-400'
        }
        ${isOver ? 'bg-indigo-100 border-indigo-400 scale-105 border-solid' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
