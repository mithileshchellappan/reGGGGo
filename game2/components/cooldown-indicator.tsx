"use client"

import type React from "react"

import { useEffect, useState } from "react"

interface CooldownIndicatorProps {
  remainingTime: number
}

export const CooldownIndicator: React.FC<CooldownIndicatorProps> = ({ remainingTime }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  // Format the remaining time
  const formattedTime = (remainingTime / 1000).toFixed(1)

  return (
    <div
      className="fixed z-50 pointer-events-none"
      style={{
        left: `${mousePosition.x}px`,
        top: `${mousePosition.y - 40}px`,
        transform: "translate(-50%, -50%)",
      }}
    >
      <div className="bg-black/80 text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse">
        {formattedTime}s
      </div>
    </div>
  )
}

