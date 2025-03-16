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

export const emitBrickDeleted = (index: number, brick: Brick) => {
  if (!brick) {
    console.error(`Cannot emit brick delete: no brick at index ${index}`);
    return;
  }
  
  if (!brick.id) {
    console.error(`Cannot emit brick delete: brick at index ${index} has no ID`);
    return;
  }
  
  console.log(`Emitting CHANNEL_BRICK_DELETED for brick ID: ${brick.id}`);
  
  sendMessage({
    type: MessageType.BRICK_DELETED,
    data: {
      index,
      brick,
      brickId: brick.id, // Add the brick ID for more robust identification
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
  isFromChannel = false, // Add flag to indicate if this action came from channel
) => {
  // Check if the brick with this ID already exists
  if (bricks.some(existingBrick => existingBrick.id === brick.id)) {
    console.log(`Brick with ID ${brick.id} already exists, skipping add`);
    return; // Skip adding duplicate brick
  }
  console.log(bricks,brick)
  const newBricks = [...bricks, brick];
  setBricks(newBricks);
  
  const newHistory = history.slice(0, historyIndex + 1);
  newHistory.push(newBricks);
  setHistory(newHistory);
  setHistoryIndex(historyIndex + 1);

  // Only emit the event if it's a local action, not from channel
  if (!isFromChannel) {
    emitBrickAdded(brick);
  }
}

// Modify the handleDeleteBrick function to emit an event
export const handleDeleteBrick = (
  brick: Brick,
  index: number,
  bricks: Brick[],
  setBricks: Dispatch<SetStateAction<Brick[]>>,
  history: BrickHistory,
  historyIndex: number,
  setHistory: Dispatch<SetStateAction<BrickHistory>>,
  setHistoryIndex: Dispatch<SetStateAction<number>>,
  isFromChannel = false, // Add flag to indicate if this action came from channel
) => {
  const brickToDelete = brick;
  console.log(`🗑️ Brick to delete: ${brickToDelete}`, bricks);
  if (!brickToDelete) {
    console.log(`No brick found at index ${index}, skipping delete`);
    return;
  }
  
  console.log(`🗑️ Deleting brick with ID ${brickToDelete.id} at index ${index}, is from channel: ${isFromChannel}`);
  console.log(`Current bricks count: ${bricks.length}`);
  
  // Simply filter out the brick with the matching ID
  const newBricks = bricks.filter(brick => brick.id !== brickToDelete.id);
  console.log(`After filtering, bricks count: ${newBricks.length}`);
  
  setBricks(newBricks);
  const newHistory = history.slice(0, historyIndex + 1);
  newHistory.push(newBricks);
  setHistory(newHistory);
  setHistoryIndex(historyIndex + 1);

  // Only emit the event if it's a local action, not from channel
  if (!isFromChannel) {
    console.log(`Emitting brick deleted event for ID ${brickToDelete.id}`);
    emitBrickDeleted(index, brickToDelete);
  }
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

