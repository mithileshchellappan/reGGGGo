"use client"

import type React from "react"

import { useState, useCallback, useMemo } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { CuboidIcon as Cube, ImageIcon } from "lucide-react"
import type { BlockType } from "../block/types"

interface ToolboxProps {
  selectedBlockType: BlockType
  onSelectBlockType: (blockType: BlockType) => void
}

export const Toolbox: React.FC<ToolboxProps> = ({ selectedBlockType, onSelectBlockType }) => {
  const [isOpen, setIsOpen] = useState(false)

  // Get the icon for the currently selected block type - use useMemo to avoid re-renders
  const selectedIcon = useMemo(() => {
    switch (selectedBlockType) {
      case "regular":
        return <Cube className="w-5 h-5 stroke-[1.5]" />
      case "special":
        return <ImageIcon className="w-5 h-5 stroke-[1.5]" />
      default:
        return <Cube className="w-5 h-5 stroke-[1.5]" />
    }
  }, [selectedBlockType])

  // Use useCallback for event handlers to prevent re-renders
  const handleRegularClick = useCallback(() => {
    onSelectBlockType("regular")
    setIsOpen(false)
  }, [onSelectBlockType])

  const handleSpecialClick = useCallback(() => {
    onSelectBlockType("special")
    setIsOpen(false)
  }, [onSelectBlockType])

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 transition-colors"
          aria-label="Block Type Selector"
        >
          {selectedIcon}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-2" align="center" side="top">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleRegularClick}
            className={`p-2 rounded flex flex-col items-center gap-1 ${
              selectedBlockType === "regular" ? "bg-gray-200" : "hover:bg-gray-100"
            }`}
          >
            <Cube className="w-6 h-6" />
            <span className="text-xs">Regular</span>
          </button>

          <button
            onClick={handleSpecialClick}
            className={`p-2 rounded flex flex-col items-center gap-1 ${
              selectedBlockType === "special" ? "bg-gray-200" : "hover:bg-gray-100"
            }`}
          >
            <ImageIcon className="w-6 h-6" />
            <span className="text-xs">Special</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

