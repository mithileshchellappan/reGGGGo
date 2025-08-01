"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { ColorSelectorProps } from "./types"
import { ColorPicker } from "./color-picker"
import { DimensionControls } from "./dimension-controls"
import { FileControls } from "./file-controls"
import { MobileMenu } from "./mobile-menu"
import { Toolbox } from "./toolbox"
import { SpecialSelector } from "./special-selector"
import type { BlockType } from "../block/types"

interface ExtendedColorSelectorProps extends ColorSelectorProps {
  selectedBlockType: BlockType
  onSelectBlockType: (blockType: BlockType) => void
  selectedSpecialImage: string
  onSelectSpecialImage: (url: string) => void
  isSpecialLocked: boolean
  onToggleSpecialLock: (locked: boolean) => void
  userPurchases: { [key: string]: boolean }
}

export const ColorSelector: React.FC<ExtendedColorSelectorProps> = ({
  colors,
  selectedColor,
  onSelectColor,
  width,
  depth,
  onWidthChange,
  onDepthChange,
  onPlayToggle,
  isPlaying,
  currentTheme,
  onThemeChange,
  bricksCount,
  showThemeSelector = true,
  selectedBlockType,
  onSelectBlockType,
  selectedSpecialImage,
  onSelectSpecialImage,
  isSpecialLocked,
  onToggleSpecialLock,
  userPurchases,
}) => {
  const [isMobile, setIsMobile] = useState(false)

  // Handle client-side mounting and detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  return (
    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex flex-col gap-4 z-10">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 backdrop-blur-md px-6 py-3 rounded-[28px] shadow-lg border border-gray-700 text-white">
        <div className="flex items-center gap-3">

          {/* Block Type Selector */}
          <Toolbox selectedBlockType={selectedBlockType} onSelectBlockType={onSelectBlockType} />

          <div className="w-px h-6 bg-gray-600" />

          {/* Color Selector (only show for regular blocks) */}
          {selectedBlockType === "regular" ? (
            <ColorPicker
              colors={colors}
              selectedColor={selectedColor}
              onSelectColor={onSelectColor}
              currentTheme={currentTheme}
              onThemeChange={onThemeChange}
              isMobile={isMobile}
              showThemeSelector={showThemeSelector}
            />
          ) : (
            <SpecialSelector
              selectedImage={selectedSpecialImage}
              onSelectImage={onSelectSpecialImage}
              isLocked={isSpecialLocked}
              onToggleLock={onToggleSpecialLock}
              userPurchases={userPurchases}
            />
          )}

          <div className="w-px h-6 bg-gray-600" />

          {/* Dimension Controls */}
          <DimensionControls
            width={width}
            height={depth}
            onWidthChange={onWidthChange}
            onHeightChange={onDepthChange}
            isMobile={isMobile}
          />

          <div className="w-px h-6 bg-gray-600" />

          {/* Desktop: Action Buttons */}
          {!isMobile && (
            <FileControls
              onPlayToggle={onPlayToggle}
              isPlaying={isPlaying}
              isMobile={isMobile}
              hasBricks={bricksCount > 0}
            />
          )}

          {/* Mobile: Menu Button */}
          {isMobile && (
            <MobileMenu
              onPlayToggle={onPlayToggle}
              isPlaying={isPlaying}
              hasBricks={bricksCount > 0}
            />
          )}
        </div>
      </div>
    </div>
  )
}

