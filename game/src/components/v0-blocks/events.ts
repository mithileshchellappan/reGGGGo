import { sendMessage } from "../../lib/real-time"
import { MessageType } from "../../lib/real-time"
import type { Dispatch, SetStateAction } from "react"

// Define types for our brick and history
export type Brick = {
  id: string
  color: string
  position: [number, number, number]
  width: number
  height: number
  username?: string
}

export type BrickHistory = Brick[][]

// Event handlers
// Add these functions to emit events when bricks are added or deleted
export const emitBrickAdded = (brick: Brick) => {
  sendMessage({
    type: MessageType.BRICK_ADDED,
    data: {
      brick,
    },
  })
}

export const emitBrickDeleted = (index: number, bricks: Brick[]) => {
  sendMessage({
    type: MessageType.BRICK_DELETED,
    data: {
      index,
      brick: bricks[index],
    },
  })
}

// Modify the handleAddBrick function to emit an event
export const handleAddBrick = (
  brick: Brick,
  bricks: Brick[],
  setBricks: Dispatch<SetStateAction<Brick[]>>,
  history: BrickHistory,
  historyIndex: number,
  setHistory: Dispatch<SetStateAction<BrickHistory>>,
  setHistoryIndex: Dispatch<SetStateAction<number>>,
) => {
  const newBricks = [...bricks, brick]
  const uniqueBricks = newBricks.filter((brick, index, self) =>
    index === self.findIndex((t) => t.id === brick.id)
  )
  setBricks(uniqueBricks)
  const newHistory = history.slice(0, historyIndex + 1)
  newHistory.push(uniqueBricks)
  setHistory(newHistory)
  setHistoryIndex(historyIndex + 1)

  // Emit the brick added event
  emitBrickAdded(brick)
}

// Modify the handleDeleteBrick function to emit an event
export const handleDeleteBrick = (
  index: number,
  bricks: Brick[],
  setBricks: Dispatch<SetStateAction<Brick[]>>,
  history: BrickHistory,
  historyIndex: number,
  setHistory: Dispatch<SetStateAction<BrickHistory>>,
  setHistoryIndex: Dispatch<SetStateAction<number>>,
) => {
  const newBricks = bricks.filter((brick) => brick.id !== bricks[index].id)
  const uniqueBricks = newBricks.filter((brick, index, self) =>
    index === self.findIndex((t) => t.id === brick.id)
  )
  setBricks(uniqueBricks)
  const newHistory = history.slice(0, historyIndex + 1)
  newHistory.push(uniqueBricks)
  setHistory(newHistory)
  setHistoryIndex(historyIndex + 1)

  // Emit the brick deleted event
  emitBrickDeleted(index, bricks)
}

export const handleUpdateBrick = (
  index: number,
  newPosition: [number, number, number],
  bricks: Brick[],
  setBricks: Dispatch<SetStateAction<Brick[]>>,
  history: BrickHistory,
  historyIndex: number,
  setHistory: Dispatch<SetStateAction<BrickHistory>>,
  setHistoryIndex: Dispatch<SetStateAction<number>>,
) => {
  const newBricks = bricks.map((brick, i) => (i === index ? { ...brick, position: newPosition } : brick))
  setBricks(newBricks)
  const newHistory = history.slice(0, historyIndex + 1)
  newHistory.push(newBricks)
  setHistory(newHistory)
  setHistoryIndex(historyIndex + 1)
}

export const handleUndo = (
  historyIndex: number,
  setHistoryIndex: Dispatch<SetStateAction<number>>,
  history: BrickHistory,
  setBricks: Dispatch<SetStateAction<Brick[]>>,
) => {
  if (historyIndex > 0) {
    const newIndex = historyIndex - 1
    setHistoryIndex(newIndex)
    setBricks(history[newIndex])
  }
}

export const handleRedo = (
  historyIndex: number,
  setHistoryIndex: Dispatch<SetStateAction<number>>,
  history: BrickHistory,
  setBricks: Dispatch<SetStateAction<Brick[]>>,
) => {
  if (historyIndex < history.length - 1) {
    const newIndex = historyIndex + 1
    setHistoryIndex(newIndex)
    setBricks(history[newIndex])
  }
}

export const handleClearSet = (
  setBricks: Dispatch<SetStateAction<Brick[]>>,
  setHistory: Dispatch<SetStateAction<BrickHistory>>,
  setHistoryIndex: Dispatch<SetStateAction<number>>,
) => {
  setBricks([])
  setHistory([[]])
  setHistoryIndex(0)
}

export const handlePlayToggle = (isPlaying: boolean, setIsPlaying: Dispatch<SetStateAction<boolean>>) => {
  setIsPlaying(!isPlaying)
}

