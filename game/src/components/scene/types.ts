import type { Brick } from "../v0-blocks/events"
import type { User, BrickWithUser } from "../../lib/real-time"

export interface SceneProps {
  bricks: Brick[]
  selectedColor: string
  width: number
  depth: number
  onAddBrick: (brick: Brick) => void
  onDeleteBrick?: (brick: Brick, index: number) => void
  isPlaying: boolean
  interactionMode?: "build" | "move" | "erase"
  isInCooldown?: boolean
  timeRemaining?: number
  totalTime?: number
  brickUsers?: BrickWithUser[]
  users?: User[]
  onUserHover?: (user: User | null, position: { x: number; y: number }) => void
}

