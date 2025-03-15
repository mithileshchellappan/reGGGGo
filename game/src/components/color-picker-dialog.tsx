"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"

interface ColorPickerDialogProps {
  isOpen: boolean
  onClose: () => void
  onColorSelect: (color: string) => void
  initialColor?: string
}

export const ColorPickerDialog: React.FC<ColorPickerDialogProps> = ({
  isOpen,
  onClose,
  onColorSelect,
  initialColor = "#FF0000",
}) => {
  const [hue, setHue] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const gradientRef = useRef<HTMLDivElement>(null)
  const hueSliderRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const isDraggingHueRef = useRef(false)

  // Convert HSV to RGB
  const hsvToRgb = (h: number, s: number, v: number) => {
    const f = (n: number, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0)
    return [f(5), f(3), f(1)].map((x) => Math.round(x * 255))
  }

  // Convert position to color
  const getColorFromPosition = (x: number, y: number) => {
    const saturation = Math.min(1, Math.max(0, x))
    const value = Math.min(1, Math.max(0, 1 - y))
    const [r, g, b] = hsvToRgb(hue, saturation, value)
    return `rgb(${r}, ${g}, ${b})`
  }

  // Handle gradient click/drag
  const handleGradientInteraction = (clientX: number, clientY: number) => {
    if (!gradientRef.current) return

    const rect = gradientRef.current.getBoundingClientRect()
    const x = (clientX - rect.left) / rect.width
    const y = (clientY - rect.top) / rect.height

    setPosition({
      x: Math.min(1, Math.max(0, x)),
      y: Math.min(1, Math.max(0, y)),
    })

    const color = getColorFromPosition(x, y)
    onColorSelect(color)
  }

  // Handle hue slider interaction
  const handleHueInteraction = (clientX: number) => {
    if (!hueSliderRef.current) return

    const rect = hueSliderRef.current.getBoundingClientRect()
    const x = (clientX - rect.left) / rect.width
    const newHue = Math.min(360, Math.max(0, x * 360))
    setHue(newHue)
  }

  // Mouse event handlers for gradient
  const handleGradientMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true
    handleGradientInteraction(e.clientX, e.clientY)
  }

  // Mouse event handlers for hue slider
  const handleHueMouseDown = (e: React.MouseEvent) => {
    isDraggingHueRef.current = true
    handleHueInteraction(e.clientX)
  }

  // Global mouse event handlers
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDraggingRef.current) {
        handleGradientInteraction(e.clientX, e.clientY)
      }
      if (isDraggingHueRef.current) {
        handleHueInteraction(e.clientX)
      }
    }

    const handleMouseUp = () => {
      isDraggingRef.current = false
      isDraggingHueRef.current = false
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-gray-900 rounded-lg p-4 max-w-[400px] w-full shadow-xl border border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Color gradient area */}
        <div
          ref={gradientRef}
          className="w-full h-[200px] rounded-lg relative cursor-crosshair"
          style={{
            background: `linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 100%), 
                        linear-gradient(to right, rgba(255,255,255,1) 0%, hsl(${hue}, 100%, 50%) 100%)`,
          }}
          onMouseDown={handleGradientMouseDown}
        >
          {/* Color picker indicator */}
          <div
            className="w-4 h-4 rounded-full border-2 border-white absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{
              left: `${position.x * 100}%`,
              top: `${position.y * 100}%`,
              boxShadow: "0 0 0 1px rgba(0,0,0,0.5)",
            }}
          />
        </div>

        {/* Hue slider */}
        <div
          ref={hueSliderRef}
          className="w-full h-3 rounded-full mt-4 cursor-pointer"
          style={{
            background:
              "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
          }}
          onMouseDown={handleHueMouseDown}
        >
          {/* Hue slider thumb */}
          <div
            className="w-4 h-4 -mt-0.5 rounded-full bg-white border-2 border-gray-800 absolute -translate-x-1/2"
            style={{ left: `${(hue / 360) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

