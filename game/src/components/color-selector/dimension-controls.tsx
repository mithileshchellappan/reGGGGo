"use client"

import type React from "react"
import { ArrowLeftRight } from "lucide-react"
import { SimpleTooltip } from "../simple-tooltip"
import { DimensionScrubber } from "../dimension-scrubber"

interface DimensionControlsProps {
  width: number
  height: number
  onWidthChange: (width: number) => void
  onHeightChange: (height: number) => void
  isMobile: boolean
}

export const DimensionControls: React.FC<DimensionControlsProps> = ({
  width,
  height,
  onWidthChange,
  onHeightChange,
  isMobile,
}) => {
  // Function to swap width and height
  const handleSwapDimensions = () => {
    onWidthChange(height)
    onHeightChange(width)
  }

  return (
    <div className="flex items-center gap-2">
      <DimensionScrubber
        value={width}
        onChange={onWidthChange}
        min={1}
        max={20}
        label="W"
        tooltip={isMobile ? undefined : "Width ([ smaller, ] bigger)"}
      />

      <SimpleTooltip text="Swap (s)" position="top">
        <button
          onClick={handleSwapDimensions}
          className="text-gray-300 hover:text-white transition-colors"
          aria-label="Swap dimensions"
        >
          <ArrowLeftRight className="w-4 h-4 stroke-[1.5]" />
        </button>
      </SimpleTooltip>

      <DimensionScrubber
        value={height}
        onChange={onHeightChange}
        min={1}
        max={20}
        label="D"
        tooltip={isMobile ? undefined : "Depth (; smaller, ' bigger)"}
      />
    </div>
  )
}

