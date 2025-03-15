"use client"

import type React from "react"
import { useState } from "react"
import { SimpleTooltip } from "../simple-tooltip"
import { MaybeTooltip } from "./maybe-tooltip"
import { lightenColor } from "../../../../lib/utils/lighten-color"
import type { ColorTheme } from "./types"
import { ColorPickerDialog } from "../color-picker-dialog"

interface ColorPickerProps {
  colors: string[]
  selectedColor: string
  onSelectColor: (color: string) => void
  currentTheme: ColorTheme
  onThemeChange: (theme: ColorTheme) => void
  isMobile: boolean
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  colors,
  selectedColor,
  onSelectColor,
  currentTheme,
  isMobile,
}) => {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false)

  // We'll only show 4 primary colors in the main toolbar
  const primaryColors = colors.slice(0, 4)

  // Color names for tooltips based on theme
  const colorNames = {
    default: ["Red", "Orange", "Yellow", "Green"],
    muted: ["Muted Red", "Muted Orange", "Muted Yellow", "Muted Green"],
    monochrome: ["White", "Light Gray 1", "Light Gray 2", "Mid Gray 1"],
  }

  const ColorButton = ({ color, isSelected, onClick, index }) => (
    <MaybeTooltip text={`${colorNames[currentTheme][index]} (${index + 1})`} isMobile={isMobile}>
      <button
        className={`w-8 h-8 rounded-full transition-all ${isSelected ? "ring-2 ring-white ring-offset-1 ring-offset-gray-800" : ""}`}
        style={{
          background: `linear-gradient(135deg, ${lightenColor(color, 50)}, ${color})`,
        }}
        onClick={() => onClick(color)}
      />
    </MaybeTooltip>
  )

  const CircularColorPicker = () => (
    <SimpleTooltip text="Color Picker" position="top">
      <button
        onClick={() => setIsColorPickerOpen(true)}
        className={`w-8 h-8 rounded-full overflow-hidden relative transition-all ${
          selectedColor === "custom" ? "ring-2 ring-white ring-offset-1 ring-offset-gray-800" : ""
        }`}
        aria-label="Open color picker"
      >
        <div
          className="absolute inset-0"
          style={{
            background: `conic-gradient(
              from 0deg,
              #FF3333,
              #FF9933,
              #FFCC33,
              #33CC66,
              #33CCFF,
              #3366CC,
              #9933CC,
              #FF3333
            )`,
          }}
        />
      </button>
    </SimpleTooltip>
  )

  return (
    <div className="flex gap-1.5">
      <div className="flex gap-1.5 relative">
        {/* Show only 4 primary colors */}
        {primaryColors.map((color, index) => (
          <ColorButton
            key={color}
            color={color}
            isSelected={color === selectedColor}
            onClick={onSelectColor}
            index={index}
          />
        ))}

        {/* Circular color picker button */}
        <CircularColorPicker />

        {/* Color picker dialog */}
        <ColorPickerDialog
          isOpen={isColorPickerOpen}
          onClose={() => setIsColorPickerOpen(false)}
          onColorSelect={(color) => {
            onSelectColor(color)
            setIsColorPickerOpen(false)
          }}
          initialColor={selectedColor}
        />
      </div>
    </div>
  )
}

