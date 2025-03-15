"use client"

import type React from "react"
import { Dialog } from "../ui/dialog"
import { Button } from "../ui/button"

interface ClearConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  onClear: () => void
}

export const ClearConfirmationModal: React.FC<ClearConfirmationModalProps> = ({ isOpen, onClose, onClear }) => {
  // Create a handler that prevents event propagation
  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onClear()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={onClose}>
        <div
          className="bg-white dark:bg-gray-900 p-6 rounded-[28px] max-w-md w-full mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className="text-2xl font-bold">Clear Set</h2>
          <p className="text-gray-700 dark:text-gray-300 mt-2">
            Are you sure you want to clear the entire set? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button onClick={onClose} variant="outline" className="rounded-full">
              Cancel
            </Button>
            <Button onClick={handleClear} variant="destructive" className="rounded-full">
              Clear
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}

