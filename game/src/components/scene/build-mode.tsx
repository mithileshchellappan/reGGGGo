"use client"

import type React from "react"
import { Block } from "../block"
import { ImageBlock } from "../block/image-block"
import { HighlightSquare } from "../highlight-square"
import type { BlockType } from "../block/types"
import { SPECIAL_IMAGES } from "../../lib/constants"

interface BuildModeProps {
  showNewBrick: boolean
  isValid: boolean
  currentBrickPosition: [number, number, number]
  selectedColor: string
  width: number
  depth: number
  selectedBlockType: BlockType
  selectedSpecialImage?: string
  isSpecialLocked?: boolean
}

export const BuildMode: React.FC<BuildModeProps> = ({
  showNewBrick,
  isValid,
  currentBrickPosition,
  selectedColor,
  width,
  depth,
  selectedBlockType,
  selectedSpecialImage = SPECIAL_IMAGES[0].imageUrl,
  isSpecialLocked = false,
}) => {
  if (!showNewBrick) return null

  // Determine which block component to render based on selected block type
  const renderBlockPreview = () => {
    if (selectedBlockType === "special" && selectedSpecialImage) {
      return (
        <ImageBlock
          color={selectedColor}
          position={currentBrickPosition}
          width={width}
          height={depth}
          isPlacing={true}
          opacity={0.6}
          imageUrl={selectedSpecialImage}
          isLocked={isSpecialLocked}
        />
      )
    } else {
      return (
        <Block
          color={selectedColor}
          position={currentBrickPosition}
          width={width}
          height={depth}
          isPlacing={true}
          opacity={0.6}
        />
      )
    }
  }

  return (
    <>
      {renderBlockPreview()}
      <HighlightSquare
        position={[currentBrickPosition[0], 0.01, currentBrickPosition[2]]}
        isValid={isValid}
        width={width}
        height={depth}
      />
    </>
  )
}

