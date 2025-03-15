import type React from "react"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export const Dialog: React.FC<DialogProps> = ({ open = false, onOpenChange, children }) => {
  return open ? <div className="fixed inset-0 z-50">{children}</div> : null
}

interface DialogContentProps {
  children: React.ReactNode
  className?: string
}

export const DialogContent: React.FC<DialogContentProps> = ({ children, className }) => {
  return <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg ${className || ""}`}>{children}</div>
}

interface DialogHeaderProps {
  children: React.ReactNode
}

export const DialogHeader: React.FC<DialogHeaderProps> = ({ children }) => {
  return <div>{children}</div>
}

interface DialogTitleProps {
  children: React.ReactNode
  className?: string
}

export const DialogTitle: React.FC<DialogTitleProps> = ({ children, className }) => {
  return <h2 className={`text-lg font-semibold ${className || ""}`}>{children}</h2>
}

interface DialogDescriptionProps {
  children: React.ReactNode
  className?: string
}

export const DialogDescription: React.FC<DialogDescriptionProps> = ({ children, className }) => {
  return <p className={`text-sm text-gray-500 dark:text-gray-400 ${className || ""}`}>{children}</p>
}

interface DialogFooterProps {
  children: React.ReactNode
  className?: string
}

export const DialogFooter: React.FC<DialogFooterProps> = ({ children, className }) => {
  return <div className={`flex justify-end ${className || ""}`}>{children}</div>
}

