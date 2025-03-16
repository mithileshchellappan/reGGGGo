"use client"

import type React from "react"
import { Block } from "../block"
import { HighlightSquare } from "../highlight-square"

interface BuildModeProps {
  showNewBrick: boolean
  isValid: boolean
  currentBrickPosition: [number, number, number]
  selectedColor: string
  width: number
  depth: number
  previewBrickId: string
}

export const BuildMode: React.FC<BuildModeProps> = ({
  showNewBrick,
  isValid,
  currentBrickPosition,
  selectedColor,
  width,
  depth,
  previewBrickId,
}) => {
  if (!showNewBrick) return null

  return (
    <>
      <Block
        id={previewBrickId}
        color={selectedColor}
        position={currentBrickPosition}
        width={width}
        height={depth}
        isPlacing={true}
        opacity={0.6} // Make the highlight brick semi-transparent
      />
      <HighlightSquare
        position={[currentBrickPosition[0], 0.01, currentBrickPosition[2]]}
        isValid={isValid}
        width={width}
        height={depth}
      />
    </>
  )
}

