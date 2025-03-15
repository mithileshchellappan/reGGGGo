"use client"

import { useEffect } from "react"
import type { Brick } from "./events"

interface UseRealTimeSyncProps {
  bricks: Brick[]
  setBricks: (bricks: Brick[]) => void
  setHistory: (history: Brick[][]) => void
  setHistoryIndex: (index: number) => void
}

export function useRealTimeSync({ bricks, setBricks, setHistory, setHistoryIndex }: UseRealTimeSyncProps) {
  // Set up event listeners for real-time sync
  useEffect(() => {
    // Function to handle when a brick is added by another user
    const handleBrickAdded = (event: CustomEvent<Brick>) => {
      const newBrick = event.detail

      // Add the brick to our state
      setBricks((prevBricks) => {
        const newBricks = [...prevBricks, newBrick]

        // Update history
        setHistory((prevHistory) => {
          const newHistory = [...prevHistory, newBricks]
          setHistoryIndex(newHistory.length - 1)
          return newHistory
        })

        return newBricks
      })
    }

    // Function to handle when a brick is deleted by another user
    const handleBrickDeleted = (event: CustomEvent<{ index: number }>) => {
      const { index } = event.detail

      // Remove the brick from our state
      setBricks((prevBricks) => {
        const newBricks = prevBricks.filter((_, i) => i !== index)

        // Update history
        setHistory((prevHistory) => {
          const newHistory = [...prevHistory, newBricks]
          setHistoryIndex(newHistory.length - 1)
          return newHistory
        })

        return newBricks
      })
    }

    // Add event listeners
    window.addEventListener("brickAdded", handleBrickAdded as EventListener)
    window.addEventListener("brickDeleted", handleBrickDeleted as EventListener)

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener("brickAdded", handleBrickAdded as EventListener)
      window.removeEventListener("brickDeleted", handleBrickDeleted as EventListener)
    }
  }, [setBricks, setHistory, setHistoryIndex])

  // Emit events when bricks change
  useEffect(() => {
    // This would typically be where we'd send updates to a server
    // For now, we'll just log that we would be sending updates
    console.log("Bricks updated, would sync with server:", bricks)
  }, [bricks])
}

