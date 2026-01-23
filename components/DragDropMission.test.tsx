/**
 * DragDropMission 컴포넌트 테스트 (클릭 방식)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import DragDropMission from './DragDropMission'

// react-hot-toast 모킹
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

// fetch 모킹
global.fetch = vi.fn()

describe('DragDropMission', () => {
  const mockMission = {
    id: 'mission-1',
    korean: '오늘 좋아하는 과일은?',
    template: 'I like ___ today.',
    blanks: 1,
    wordOptions: ['apple', 'banana', 'orange', 'grape'],
    correctAnswers: ['apple'],
    level: 1,
  }

  const mockOnComplete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    ;(global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        isCorrect: true,
      }),
    })
  })

  it('미션이 정상적으로 렌더링된다', () => {
    render(<DragDropMission mission={mockMission} onComplete={mockOnComplete} />)

    expect(screen.getByText('오늘 좋아하는 과일은?')).toBeInTheDocument()
    expect(screen.getByText('단어 카드를 클릭해서 문장을 완성해보세요!')).toBeInTheDocument()
    expect(screen.getByText('선택한 단어를 다시 클릭하면 취소됩니다')).toBeInTheDocument()
    expect(screen.getByText('apple')).toBeInTheDocument()
    expect(screen.getByText('banana')).toBeInTheDocument()
  })

  it('제출 버튼이 초기에는 비활성화되어 있다', () => {
    render(<DragDropMission mission={mockMission} onComplete={mockOnComplete} />)

    const submitButton = screen.getByText('제출하기 ✨')
    expect(submitButton).toBeDisabled()
  })

  it('단어 카드를 클릭하면 빈칸에 입력되고 제출 버튼이 활성화된다', async () => {
    const user = userEvent.setup()
    render(<DragDropMission mission={mockMission} onComplete={mockOnComplete} />)

    // 초기에는 제출 버튼이 비활성화되어 있음
    const submitButton = screen.getByText('제출하기 ✨')
    expect(submitButton).toBeDisabled()

    // 단어 카드 클릭 (후보 리스트에서)
    const appleButtons = screen.getAllByText('apple')
    const appleCardButton = appleButtons.find(btn => 
      btn.closest('button')?.getAttribute('title') === '클릭하여 선택'
    )
    expect(appleCardButton).toBeInTheDocument()
    if (appleCardButton?.closest('button')) {
      await user.click(appleCardButton.closest('button')!)
    }

    // 빈칸에 단어가 입력되었는지 확인 (빈칸 버튼 내부)
    await waitFor(() => {
      const blankButtons = screen.getAllByText('apple')
      const blankButton = blankButtons.find(btn => 
        btn.closest('button')?.className.includes('border-dashed')
      )
      expect(blankButton).toBeInTheDocument()
    })

    // 제출 버튼이 활성화되었는지 확인
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled()
    })
  })

  it('선택한 단어를 다시 클릭하면 취소된다', async () => {
    const user = userEvent.setup()
    render(<DragDropMission mission={mockMission} onComplete={mockOnComplete} />)

    // 단어 카드 클릭 (후보 리스트에서)
    const appleButtons = screen.getAllByText('apple')
    const appleCardButton = appleButtons.find(btn => 
      btn.closest('button')?.getAttribute('title') === '클릭하여 선택'
    )
    if (appleCardButton?.closest('button')) {
      await user.click(appleCardButton.closest('button')!)
    }

    // 빈칸에 단어가 입력되었는지 확인
    await waitFor(() => {
      const allAppleButtons = screen.getAllByText('apple')
      const blankButton = allAppleButtons.find(btn => 
        btn.closest('button')?.className.includes('border-dashed')
      )
      expect(blankButton).toBeInTheDocument()
    })

    // 비활성화된 단어 카드를 다시 클릭 (취소)
    const disabledAppleButton = screen.getAllByText('apple').find(btn => 
      btn.closest('button')?.getAttribute('title') === '클릭하여 선택 취소'
    )
    
    if (disabledAppleButton?.closest('button')) {
      await user.click(disabledAppleButton.closest('button')!)
    }

    // 빈칸이 비워졌는지 확인 (빈칸 텍스트가 표시되는지 확인)
    await waitFor(() => {
      const blankText = screen.getByText('빈칸')
      expect(blankText).toBeInTheDocument()
    })

    // 단어 카드가 다시 활성화되었는지 확인
    const activeAppleButton = screen.getAllByText('apple').find(btn => 
      btn.closest('button')?.getAttribute('title') === '클릭하여 선택'
    )
    expect(activeAppleButton).toBeInTheDocument()
  })
})
