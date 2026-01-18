'use client'

/**
 * 에너지 부족 시 카운트다운 컴포넌트
 * 
 * 에너지가 부족할 때 다음 충전까지 남은 시간을 표시합니다.
 */

import { useEffect, useState } from 'react'

interface EnergyCountdownProps {
  energy: number
  required: number
  className?: string
}

export default function EnergyCountdown({
  energy,
  required,
  className = '',
}: EnergyCountdownProps) {
  const [timeUntilNextCharge, setTimeUntilNextCharge] = useState<string>('')

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date()
      const tomorrow = new Date(now)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      const diff = tomorrow.getTime() - now.getTime()
      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (hours > 0) {
        setTimeUntilNextCharge(`${hours}시간 ${minutes}분`)
      } else {
        setTimeUntilNextCharge(`${minutes}분`)
      }
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 60000) // 1분마다 업데이트

    return () => clearInterval(interval)
  }, [])

  if (energy >= required) {
    return null // 에너지가 충분하면 표시하지 않음
  }

  return (
    <div
      className={`p-4 bg-red-50 border-2 border-red-200 rounded-lg shadow-sm ${className}`}
    >
      <div className="flex items-center space-x-2">
        <div className="text-2xl">⚡</div>
        <div className="flex-1">
          <div className="font-semibold text-red-800">
            에너지가 부족합니다
          </div>
          <div className="text-sm text-red-600 mt-1">
            현재: {energy} / 필요: {required}
          </div>
          <div className="text-xs text-red-500 mt-2">
            다음 충전까지: {timeUntilNextCharge}
          </div>
        </div>
      </div>
    </div>
  )
}
