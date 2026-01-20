'use client'

/**
 * 에너지 게이지 컴포넌트
 * 
 * 홈 화면에서 사용자의 현재 에너지를 표시합니다.
 * 키즈 앱 스타일로 반짝이는 효과와 별 요소를 포함합니다.
 */

import { useEffect, useState } from 'react'

interface EnergyGaugeProps {
  currentEnergy: number
  maxEnergy?: number
  size?: 'sm' | 'md' | 'lg'
  showCountdown?: boolean
}

export default function EnergyGauge({
  currentEnergy,
  maxEnergy = 100,
  size = 'md',
  showCountdown = true,
}: EnergyGaugeProps) {
  const [timeUntilNextCharge, setTimeUntilNextCharge] = useState<string>('')
  const percentage = Math.min((currentEnergy / maxEnergy) * 100, 100)

  // 다음 충전까지 남은 시간 계산
  useEffect(() => {
    if (!showCountdown) return

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
  }, [showCountdown])

  const sizeClasses = {
    sm: 'w-24 h-24 text-sm',
    md: 'w-32 h-32 text-base',
    lg: 'w-48 h-48 text-lg',
  }

  const isLowEnergy = percentage < 30

  return (
    <div className={`flex flex-col items-center space-y-2 ${sizeClasses[size]}`}>
      {/* 에너지 게이지 */}
      <div className="relative">
        {/* 배경 원 */}
        <div className="absolute inset-0 rounded-full bg-gray-100 border-4 border-gray-200" />
        
        {/* 에너지 막대 */}
        <div
          className={`absolute inset-0 rounded-full border-4 transition-all duration-500 ${
            isLowEnergy
              ? 'border-red-400 bg-gradient-to-b from-red-100 to-red-200'
              : 'border-yellow-400 bg-gradient-to-b from-yellow-100 to-yellow-200'
          }`}
          style={{
            clipPath: `polygon(0 ${100 - percentage}%, 100% ${100 - percentage}%, 100% 100%, 0% 100%)`,
          }}
        />

        {/* 반짝이는 효과 (키즈 스타일) */}
        {!isLowEnergy && (
          <div className="absolute inset-0 rounded-full">
            <div className="absolute top-2 left-4 w-2 h-2 bg-yellow-300 rounded-full animate-pulse" />
            <div className="absolute top-6 right-6 w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse delay-200" />
            <div className="absolute bottom-4 left-6 w-1 h-1 bg-yellow-300 rounded-full animate-pulse delay-300" />
            <div className="absolute bottom-8 right-3 w-2 h-2 bg-yellow-400 rounded-full animate-pulse delay-500" />
          </div>
        )}

        {/* 중앙 텍스트 (에너지 값) */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="font-bold text-gray-800">{currentEnergy}</div>
            <div className="text-xs text-gray-500">/ {maxEnergy}</div>
          </div>
        </div>

        {/* 별 아이콘 (에너지가 높을 때) */}
        {percentage > 50 && (
          <div className="absolute -top-1 -right-1 text-yellow-400 animate-bounce">
            ⭐
          </div>
        )}
      </div>

      {/* 카운트다운 표시 (에너지 부족 시) */}
      {showCountdown && isLowEnergy && timeUntilNextCharge && (
        <div className="text-xs text-red-600 font-semibold text-center px-2 py-1 bg-red-50 rounded-full border border-red-200">
          다음 충전까지: {timeUntilNextCharge}
        </div>
      )}

      {/* 에너지 레이블 */}
      <div className="text-sm font-medium text-gray-700">에너지</div>
    </div>
  )
}
