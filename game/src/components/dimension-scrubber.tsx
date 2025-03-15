"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"
import { SimpleTooltip } from "./simple-tooltip"

interface DimensionScrubberProps {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  label?: string
  tooltip?: string
}

export const DimensionScrubber: React.FC<DimensionScrubberProps> = ({
  value,
  min = 1,
  max = 4,
  onChange,
  label,
  tooltip,
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [startY, setStartY] = useState(0)
  const [startValue, setStartValue] = useState(value)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle mouse down to start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setStartY(e.clientY)
    setStartValue(value)

    // Add event listeners for mouse move and mouse up
    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  // Handle touch start for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setStartY(e.touches[0].clientY)
    setStartValue(value)

    // Add event listeners for touch move and touch end
    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd)
  }

  // Handle mouse move during drag
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    // Calculate the delta and adjust the value
    // Moving up increases the value, moving down decreases it
    const deltaY = e.clientY - startY
    const sensitivity = 10 // Pixels per value change
    const newValue = Math.max(min, Math.min(max, startValue - Math.round(deltaY / sensitivity)))

    if (newValue !== value) {
      onChange(newValue)
    }
  }

  // Handle touch move for mobile
  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return
    e.preventDefault()

    // Calculate the delta and adjust the value
    const deltaY = e.touches[0].clientY - startY
    const sensitivity = 10 // Pixels per value change
    const newValue = Math.max(min, Math.min(max, startValue - Math.round(deltaY / sensitivity)))

    if (newValue !== value) {
      onChange(newValue)
    }
  }

  // Handle mouse up to end dragging
  const handleMouseUp = () => {
    setIsDragging(false)
    document.removeEventListener("mousemove", handleMouseMove)
    document.removeEventListener("mouseup", handleMouseUp)
  }

  // Handle touch end for mobile
  const handleTouchEnd = () => {
    setIsDragging(false)
    document.removeEventListener("touchmove", handleTouchMove)
    document.removeEventListener("touchend", handleTouchEnd)
  }

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }
  }, [isDragging, startY, startValue, value, min, max, onChange])

  // Handle increment and decrement buttons
  const increment = () => {
    if (value < max) {
      onChange(value + 1)
    }
  }

  const decrement = () => {
    if (value > min) {
      onChange(value - 1)
    }
  }

  const content = (
    <div
      ref={containerRef}
      className={`flex items-center justify-between bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-white font-medium text-sm min-w-[60px] cursor-ns-resize ${isDragging ? "bg-gray-600" : ""}`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <button
        className="text-gray-300 hover:text-white transition-colors mr-1"
        onClick={decrement}
        aria-label="Decrease"
      >
        <ChevronDown className="w-3 h-3" />
      </button>

      <span className="select-none">
        {label && <span className="text-gray-400 mr-1">{label}:</span>}
        {value}
      </span>

      <button
        className="text-gray-300 hover:text-white transition-colors ml-1"
        onClick={increment}
        aria-label="Increase"
      >
        <ChevronUp className="w-3 h-3" />
      </button>
    </div>
  )

  return tooltip ? (
    <SimpleTooltip text={tooltip} position="top">
      {content}
    </SimpleTooltip>
  ) : (
    content
  )
}

