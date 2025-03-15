"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"

interface CanvasResizeModalProps {
  isOpen: boolean
  onClose: () => void
  onResize: (size: number) => void
  currentSize: number
  maxSize: number
}

export const CanvasResizeModal: React.FC<CanvasResizeModalProps> = ({
  isOpen,
  onClose,
  onResize,
  currentSize,
  maxSize,
}) => {
  const [canvasSize, setCanvasSize] = useState(currentSize)

  const handleResize = () => {
    onResize(canvasSize)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-[28px]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Resize Canvas</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="mb-4 text-gray-600">
            Adjust the size of your canvas (maximum {maxSize}x{maxSize})
          </p>

          <div className="space-y-6">
            <div className="flex flex-col space-y-2">
              <div className="flex justify-between">
                <span>
                  Canvas Size: {canvasSize}x{canvasSize}
                </span>
                <span className="text-gray-500">{Math.round((canvasSize / maxSize) * 100)}%</span>
              </div>
              <Slider
                value={[canvasSize]}
                min={10}
                max={maxSize}
                step={2}
                onValueChange={(value) => setCanvasSize(value[0])}
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[20, 30, 40, 60].map((size) => (
                <Button
                  key={size}
                  variant={canvasSize === size ? "default" : "outline"}
                  onClick={() => setCanvasSize(size)}
                  className="rounded-full"
                >
                  {size}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-3">
          <Button onClick={onClose} variant="outline" className="rounded-full">
            Cancel
          </Button>
          <Button onClick={handleResize} variant="default" className="rounded-full bg-black hover:bg-gray-800">
            Resize
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

