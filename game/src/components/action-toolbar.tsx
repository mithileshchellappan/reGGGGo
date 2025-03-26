"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Hammer, Eraser } from "lucide-react"
import { SimpleTooltip } from "./simple-tooltip"

interface ActionToolbarProps {
  onModeChange: (mode: "build" | "move" | "erase") => void
  currentMode: "build" | "move" | "erase"
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({ onModeChange, currentMode }) => {
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Conditionally render tooltip based on device
  const MaybeTooltip = ({ text, children }: { text: string, children: React.ReactNode }) => {
    if (isMobile) {
      return children
    }
    return (
      <SimpleTooltip text={text} position="right">
        {children}
      </SimpleTooltip>
    )
  }

  return (
    <div className="fixed top-4 left-4 flex flex-col gap-3 z-20">
      <MaybeTooltip text="Build (b)">
        <button
          onClick={() => onModeChange("build")}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            currentMode === "build" ? "bg-black text-white" : "bg-black/30 text-white hover:bg-black/50"
          }`}
          aria-label="Build Mode (B)"
          aria-pressed={currentMode === "build"}
        >
          <Hammer className="w-5 h-5 stroke-[1.5]" />
        </button>
      </MaybeTooltip>

      <MaybeTooltip text="Erase (e)">
        <button
          onClick={() => onModeChange("erase")}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
            currentMode === "erase" ? "bg-black text-white" : "bg-black/30 text-white hover:bg-black/50"
          }`}
          aria-label="Erase Mode (E)"
          aria-pressed={currentMode === "erase"}
        >
          <Eraser className="w-5 h-5 stroke-[1.5]" />
        </button>
      </MaybeTooltip>
    </div>
  )
}

