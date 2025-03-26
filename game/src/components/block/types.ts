export interface BlockProps {
  id?: string
  color: string
  position: [number, number, number]
  width: number
  height: number
  isPlacing?: boolean
  opacity?: number
  username?: string
  onClick?: () => void
  isInCooldown?: boolean
  imageId?: string
  isLocked?: boolean
}

export type BlockType = "regular" | "special"