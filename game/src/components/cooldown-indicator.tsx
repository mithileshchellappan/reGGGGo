"use client"

import type React from "react"

import { useEffect, useState, useRef } from "react"

interface CooldownIndicatorProps {
  remainingTime: number
}

export const CooldownIndicator: React.FC<CooldownIndicatorProps> = ({ remainingTime }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [displayTime, setDisplayTime] = useState(remainingTime)
  const startTimeRef = useRef<number>(Date.now())
  const initialTimeRef = useRef<number>(remainingTime)
  const animationFrameRef = useRef<number | null>(null)

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

  // Handle countdown timer
  useEffect(() => {
    // Reset timer when remainingTime prop changes
    initialTimeRef.current = remainingTime
    startTimeRef.current = Date.now()
    setDisplayTime(remainingTime)
    
    const updateTimer = () => {
      const elapsed = Date.now() - startTimeRef.current
      const newRemainingTime = Math.max(0, initialTimeRef.current - elapsed)
      setDisplayTime(newRemainingTime)
      
      if (newRemainingTime > 0) {
        animationFrameRef.current = requestAnimationFrame(updateTimer)
      }
    }
    
    animationFrameRef.current = requestAnimationFrame(updateTimer)
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [remainingTime])

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
        {(displayTime / 1000).toFixed(1)}s
      </div>
    </div>
  )
}

