export interface BlockProps {
  color: string
  position: [number, number, number]
  width: number
  height: number
  isPlacing?: boolean
  opacity?: number
  username?: string
  onClick?: () => void
}

