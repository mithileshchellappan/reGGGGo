"use client"

import type React from "react"
import { Clock } from "lucide-react"

interface TimerDisplayProps {
  timeRemaining: number
  totalTime: number
  onTimerEnd?: () => void
}

export const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeRemaining, totalTime, onTimerEnd }) => {
  // Format time as mm:ss
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate progress percentage
  const progressPercent = Math.max(0, Math.min(100, (timeRemaining / totalTime) * 100))

  // Determine color based on remaining time
  const getColor = () => {
    if (progressPercent > 66) return "bg-green-500"
    if (progressPercent > 33) return "bg-yellow-500"
    return "bg-red-500"
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/70 rounded-full px-4 py-2 text-white flex items-center gap-2">
      <Clock className="w-5 h-5" />
      <div className="font-mono text-lg">{formatTime(timeRemaining)}</div>

      {/* Progress bar */}
      <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden ml-2">
        <div className={`h-full ${getColor()} transition-all duration-200`} style={{ width: `${progressPercent}%` }} />
      </div>
    </div>
  )
}

