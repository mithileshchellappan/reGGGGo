"use client"

import { useState, useCallback, useEffect, useRef } from "react"

export function useCooldown(cooldownDuration = 3000) {
  const [isInCooldown, setIsInCooldown] = useState(false)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null)
  const cooldownStartTimeRef = useRef<number>(0)
  const animationFrameRef = useRef<number | null>(null)

  // Function to update the remaining cooldown time
  const updateRemainingTime = useCallback(() => {
    if (!isInCooldown) return

    const elapsed = Date.now() - cooldownStartTimeRef.current
    const remaining = Math.max(0, cooldownDuration - elapsed)
    console.log("remaining", remaining)
    setCooldownRemaining(remaining)

    if (remaining <= 0) {
      setIsInCooldown(false)
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current)
        cooldownTimerRef.current = null
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    } else {
      animationFrameRef.current = requestAnimationFrame(updateRemainingTime)
    }
  }, [cooldownDuration, isInCooldown])

  // Function to start the cooldown
  const startCooldown = useCallback(() => {
    // Clear any existing cooldown
    if (cooldownTimerRef.current) {
      clearTimeout(cooldownTimerRef.current)
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    // Set cooldown state
    setIsInCooldown(true)
    setCooldownRemaining(cooldownDuration)
    cooldownStartTimeRef.current = Date.now()

    // Start the animation frame to update the remaining time
    animationFrameRef.current = requestAnimationFrame(updateRemainingTime)

    // Set a timeout to end the cooldown
    cooldownTimerRef.current = setTimeout(() => {
      setIsInCooldown(false)
      cooldownTimerRef.current = null
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
        animationFrameRef.current = null
      }
    }, cooldownDuration)
  }, [cooldownDuration, updateRemainingTime])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return {
    isInCooldown,
    cooldownRemaining,
    startCooldown,
  }
}

