"use client"

import type React from "react"
import { Play, Trash2, Menu } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"

interface MobileMenuProps {
  onPlayToggle: () => void
  isPlaying: boolean
  hasBricks: boolean
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ onPlayToggle, isPlaying, hasBricks }) => {
  return (
    <div className="flex items-center">
      <Popover>
        <PopoverTrigger asChild>
          <button className="text-white hover:text-gray-300 transition-colors" aria-label="Menu">
            <Menu className="w-5 h-5 stroke-[1.5]" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[180px] p-0" align="center" side="top">
          <div className="py-2">
            <button
              onClick={onPlayToggle}
              className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100"
            >
              <Play className="w-4 h-4 stroke-[1.5]" />
              <span>{isPlaying ? "Stop" : "Play"}</span>
            </button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

