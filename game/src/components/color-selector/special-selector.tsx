"use client"

import type React from "react"

import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover"
import { Lock, Unlock } from "lucide-react"
import { Switch } from "../../components/ui/switch"
import { Label } from "../../components/ui/label"
import { SPECIAL_IMAGES } from "../../lib/constants"

interface SpecialSelectorProps {
  onSelectImage: (id: string) => void
  selectedImage: string
  isLocked: boolean
  onToggleLock: (locked: boolean) => void
  userPurchases: { [key: string]: boolean }
}

export const SpecialSelector: React.FC<SpecialSelectorProps> = ({
  onSelectImage,
  selectedImage,
  isLocked,
  onToggleLock,
  userPurchases,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  
  // Find the current image texture for display
  const currentImageTexture = SPECIAL_IMAGES.find(img => img.id === selectedImage)?.color || '';

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <button
            className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 transition-colors overflow-hidden border-2 border-gray-600"
            style={{
              backgroundImage: `url(${currentImageTexture})`,
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
              {SPECIAL_IMAGES.map((image) => (
                <button
                  disabled={!userPurchases[image.id]}
                  key={image.id}
                  className={`w-14 h-14 rounded-md overflow-hidden border-2 transition-all relative ${
                    selectedImage === image.id ? "border-primary" : "border-transparent hover:border-gray-300"
                  }`}
                  style={{
                    backgroundImage: `url(${image.color})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                  onClick={() => {
                    onSelectImage(image.id)
                    setIsOpen(false)
                  }}
                >
                  {!userPurchases[image.id] && (
                    <div className="absolute top-0 left-0 bg-black/50 p-1 rounded-br">
                      <Lock className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}

