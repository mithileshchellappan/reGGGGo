"use client"

import React from "react"
import { Play, Trash2, Menu } from "lucide-react"

interface MobileMenuProps {
  onPlayToggle: () => void
  isPlaying: boolean
  onSave: () => void
  onLoad: () => void
  onClearSet: () => void
  hasBricks: boolean
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  onPlayToggle,
  isPlaying,
  onSave,
  onLoad,
  onClearSet,
  hasBricks,
}) => {
  const [isOpen, setIsOpen] = React.useState(false)

  return (
    <div className="flex items-center relative">
      <button
        className="text-white hover:text-gray-300 transition-colors"
        aria-label="Menu"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Menu className="w-5 h-5 stroke-[1.5]" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-2 w-[180px] bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden z-50">
            <div className="py-2">
              <button
                onClick={() => {
                  onPlayToggle()
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Play className="w-4 h-4 stroke-[1.5]" />
                <span>{isPlaying ? "Stop" : "Play"}</span>
              </button>

              <div className="my-1 border-t border-gray-200 dark:border-gray-700"></div>

              <button
                onClick={() => {
                  onClearSet()
                  setIsOpen(false)
                }}
                className={`w-full flex items-center gap-2 px-4 py-2 text-left ${
                  hasBricks
                    ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    : "text-gray-400 cursor-not-allowed"
                }`}
                disabled={!hasBricks}
              >
                <Trash2
                  className={`w-4 h-4 stroke-[1.5] ${hasBricks ? "text-red-600 dark:text-red-400" : "text-gray-400"}`}
                />
                <span>Clear</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

