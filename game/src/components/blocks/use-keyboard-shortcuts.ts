"use client"

import { useEffect } from "react"

// Helper function to check if we're currently focused on an input element
function isInputElement(): boolean {
  const activeElement = document.activeElement
  if (!activeElement) return false

  const tagName = activeElement.tagName.toLowerCase()
  const isEditable =
    activeElement.hasAttribute("contenteditable") && activeElement.getAttribute("contenteditable") !== "false"

  return tagName === "input" || tagName === "textarea" || tagName === "select" || isEditable
}

interface UseKeyboardShortcutsProps {
  isPlaying: boolean
  width: number
  depth: number
  currentColors: string[]
  setWidth: (width: number) => void
  setDepth: (depth: number) => void
  setSelectedColor: (color: string) => void
  setInteractionMode: (mode: "build" | "move" | "erase") => void
  onPlayToggle: () => void
  currentTheme: string
  handleThemeChange: (theme: string) => void
  toggleCameraMode?: () => void  // Add new prop for camera mode toggle
}

export function useKeyboardShortcuts({
  isPlaying,
  width,
  depth,
  currentColors,
  setWidth,
  setDepth,
  setSelectedColor,
  setInteractionMode,
  onPlayToggle,
  currentTheme,
  handleThemeChange,
  toggleCameraMode,
}: UseKeyboardShortcutsProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if there's an input element focused
      if (
        document.activeElement &&
        (document.activeElement.tagName === "INPUT" ||
          document.activeElement.tagName === "TEXTAREA" ||
          (document.activeElement as HTMLElement).isContentEditable)
      ) {
        return
      }

      // Only apply keyboard shortcuts when not playing
      if (isPlaying) {
        // Allow only space to stop playing
        if (event.key === " ") {
          onPlayToggle()
        }
        return
      }

      // Size adjustments
      if (event.key === "ArrowUp" && !event.shiftKey) {
        event.preventDefault()
        setWidth(Math.min(width + 1, 8))
      } else if (event.key === "ArrowDown" && !event.shiftKey) {
        event.preventDefault()
        setWidth(Math.max(width - 1, 1))
      } else if (event.key === "ArrowRight" && !event.shiftKey) {
        event.preventDefault()
        setDepth(Math.min(depth + 1, 8))
      } else if (event.key === "ArrowLeft" && !event.shiftKey) {
        event.preventDefault()
        setDepth(Math.max(depth - 1, 1))
      }

      // Color selection
      if (event.key >= "1" && event.key <= "9") {
        const colorIndex = parseInt(event.key) - 1
        if (colorIndex < currentColors.length) {
          setSelectedColor(currentColors[colorIndex])
        }
      }

      // Mode switching
      if (event.key === "b" || event.key === "B") {
        setInteractionMode("build")
      } else if (event.key === "m" || event.key === "M") {
        setInteractionMode("move")
      } else if (event.key === "x" || event.key === "X") {
        setInteractionMode("erase")
      }

      // Play toggle
      if (event.key === " " || event.key === "Enter") {
        onPlayToggle()
      }

      // Theme switching
      if (event.key === "t" || event.key === "T") {
        const themes = ["default", "vintage", "modern", "dark", "pastel"]
        const currentIndex = themes.indexOf(currentTheme)
        const nextIndex = (currentIndex + 1) % themes.length
        handleThemeChange(themes[nextIndex])
      }
      
      // Camera mode toggle
      if ((event.key === "v" || event.key === "V") && toggleCameraMode) {
        toggleCameraMode()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    isPlaying,
    width,
    depth,
    currentColors,
    setWidth,
    setDepth,
    setSelectedColor,
    setInteractionMode,
    onPlayToggle,
    currentTheme,
    handleThemeChange,
    toggleCameraMode,
  ])
}

