import type { Brick } from "../blocks/events"

export interface SceneProps {
  bricks: Brick[]
  selectedColor: string
  width: number
  depth: number
  onAddBrick: (brick: Brick) => void
  onDeleteBrick?: (brick: Brick, index: number) => void
  onUpdateBrick?: (index: number, newPosition: [number, number, number]) => void
  isPlaying: boolean
  interactionMode?: "build" | "move" | "erase"
  isInCooldown?: boolean
}

