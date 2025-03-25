"use client"

import type React from "react"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { Lock, Unlock } from "lucide-react"
import { Switch } from "../../components/ui/switch"
import { Label } from "../../components/ui/label"
import { SPECIAL_IMAGES as specialImages } from "../../lib/constants"
interface SpecialSelectorProps {
  onSelectImage: (url: string) => void
  selectedImage: string
  isLocked: boolean
  onToggleLock: (locked: boolean) => void
}

export const SpecialSelector: React.FC<SpecialSelectorProps> = ({
  onSelectImage,
  selectedImage,
  isLocked,
  onToggleLock,
}) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 transition-colors overflow-hidden border-2 border-gray-600"
            style={{
              backgroundImage: `url(${selectedImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <Lock className="w-4 h-4 text-white" />
              </div>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-3" align="center" side="top">
          <div className="mb-3">
            <div className="grid grid-cols-4 gap-2">
              {specialImages.map((url, index) => (
                <button
                  key={index}
                  className={`w-14 h-14 rounded-md overflow-hidden border-2 transition-all ${
                    selectedImage === url.imageUrl ? "border-primary" : "border-transparent hover:border-gray-300"
                  }`}
                  style={{
                    backgroundImage: `url(${url.imageUrl})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  onClick={() => {
                    onSelectImage(url.imageUrl)
                    setIsOpen(false)
                  }}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

