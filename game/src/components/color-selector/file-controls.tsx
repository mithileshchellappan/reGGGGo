"use client"

import type React from "react"
import { Play, Trash2 } from "lucide-react"
import { MaybeTooltip } from "./maybe-tooltip"

interface FileControlsProps {
  onPlayToggle: () => void
  isPlaying: boolean
  isMobile: boolean
  hasBricks: boolean
}

export const FileControls: React.FC<FileControlsProps> = ({
  onPlayToggle,
  isPlaying,
  isMobile,
  hasBricks,
}) => {
  return (
    <div className="flex gap-3 items-center">
      <MaybeTooltip text="Play (⌘+Enter)" isMobile={isMobile}>
        <button
          onClick={onPlayToggle}
          className="text-white hover:text-gray-300 transition-colors"
          aria-label={isPlaying ? "Stop" : "Play"}
        >
          <Play className="w-5 h-5 stroke-[1.5]" />
        </button>
      </MaybeTooltip>
    </div>
  )
}

