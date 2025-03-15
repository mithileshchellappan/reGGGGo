"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Pause, Settings } from "lucide-react"
import { AudioPlayer } from "../audio-player"
import { Scene } from "../scene"
import { ColorSelector } from "../color-selector"
import { ActionToolbar } from "../action-toolbar"
import { ClearConfirmationModal } from "./clear-confirmation-modal"
import { CanvasResizeModal } from "../canvas-resize-modal"
import { UserHoverCard } from "../user-hover-card"
import { useKeyboardShortcuts } from "./use-keyboard-shortcuts"
import { useColorTheme } from "./use-color-theme"
import { useTouchHandling } from "./use-touch-handling"
import { useCooldown } from "./use-cooldown"
import { CooldownIndicator } from "../cooldown-indicator"
import { DEFAULT_TIMER_DURATION, GRID_SIZE, MAX_GRID_SIZE, updateGridSize } from "@/lib/constants"
import { sendMessage, onMessage, MessageType, type User, type BrickWithUser } from "@/lib/real-time"
import type { Brick } from "./events"
import {
  handleAddBrick,
  handleDeleteBrick,
  handleUpdateBrick,
  handleUndo,
  handleRedo,
  handleClearSet,
  handlePlayToggle,
} from "./events"

export default function V0Blocks() {
  // Theme and colors
  const { currentTheme, currentColors, selectedColor, setSelectedColor, handleSelectColor, handleThemeChange } =
    useColorTheme()

  // State
  const [bricks, setBricks] = useState<Brick[]>([])
  const [history, setHistory] = useState<Brick[][]>([[]])
  const [historyIndex, setHistoryIndex] = useState(0)
  const [width, setWidth] = useState(2)
  const [depth, setDepth] = useState(2)
  const [isPlaying, setIsPlaying] = useState(false)
  const [interactionMode, setInteractionMode] = useState<"build" | "move" | "erase">("build")
  const orbitControlsRef = useRef()

  // Modal state
  const [showClearModal, setShowClearModal] = useState(false)
  const [showResizeModal, setShowResizeModal] = useState(false)

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_TIMER_DURATION)
  const [totalTime, setTotalTime] = useState(DEFAULT_TIMER_DURATION)
  const [timerActive, setTimerActive] = useState(false)

  // User state
  const [users, setUsers] = useState<User[]>([])
  const [brickUsers, setBrickUsers] = useState<BrickWithUser[]>([])
  const [hoveredUser, setHoveredUser] = useState<User | null>(null)
  const [hoveredUserPosition, setHoveredUserPosition] = useState({ x: 0, y: 0 })

  // Cooldown state
  const { isInCooldown, cooldownRemaining, startCooldown } = useCooldown(5000) // 5 seconds cooldown

  // Set up touch handling
  useTouchHandling()

  // Handle real-time messages
  useEffect(() => {
    onMessage((message) => {
      console.log("Received message:", message)

      switch (message.type) {
        case MessageType.BRICK_ADDED:
          // Add brick from another user
          const newBrick = message.brick as Brick
          setBricks((prev) => [...prev, newBrick])

          // Update brick user mapping
          if (message.userId) {
            setBrickUsers((prev) => [...prev, { brickIndex: bricks.length, userId: message.userId }])
          }
          break

        case MessageType.BRICK_DELETED:
          // Delete brick from another user
          const index = message.index as number
          setBricks((prev) => prev.filter((_, i) => i !== index))

          // Update brick user mapping
          setBrickUsers((prev) =>
            prev
              .filter((bu) => bu.brickIndex !== index)
              // Adjust indices for bricks after the deleted one
              .map((bu) => (bu.brickIndex > index ? { ...bu, brickIndex: bu.brickIndex - 1 } : bu)),
          )
          break

        case MessageType.TIMER_UPDATE:
          // Update timer
          setTimeRemaining(message.timeRemaining)
          setTotalTime(message.totalTime)
          setTimerActive(message.active)
          break

        case MessageType.CANVAS_RESIZE:
          // Resize canvas
          const newSize = message.size as number
          updateGridSize(newSize)
          break

        case MessageType.USER_JOINED:
          // Add user
          const newUser = message.user as User
          setUsers((prev) => [...prev.filter((u) => u.id !== newUser.id), newUser])
          break

        case MessageType.USER_LEFT:
          // Remove user
          const userId = message.userId as string
          setUsers((prev) => prev.filter((u) => u.id !== userId))
          break
      }
    })
  }, [bricks.length])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          const newTime = Math.max(0, prev - 1)

          // If timer reaches zero, stop it
          if (newTime === 0 && interval) {
            clearInterval(interval)
            setTimerActive(false)
          }

          return newTime
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive, timeRemaining])

  // Wrapper functions that call the imported event handlers with the current state
  const onAddBrick = useCallback(
    (brick: Brick) => {
      if (isInCooldown) return // Don't add brick if in cooldown

      handleAddBrick(brick, bricks, setBricks, history, historyIndex, setHistory, setHistoryIndex)
      startCooldown() // Start cooldown after adding a brick

      // Send message for real-time updates
      sendMessage({
        type: MessageType.BRICK_ADDED,
        brick,
        userId: "current-user-id", // Replace with actual user ID
      })
    },
    [bricks, history, historyIndex, isInCooldown, startCooldown],
  )

  const onDeleteBrick = useCallback(
    (index: number) => {
      handleDeleteBrick(index, bricks, setBricks, history, historyIndex, setHistory, setHistoryIndex)

      // Send message for real-time updates
      sendMessage({
        type: MessageType.BRICK_DELETED,
        index,
      })
    },
    [bricks, history, historyIndex],
  )

  const onUpdateBrick = useCallback(
    (index: number, newPosition: [number, number, number]) => {
      handleUpdateBrick(index, newPosition, bricks, setBricks, history, historyIndex, setHistory, setHistoryIndex)
    },
    [bricks, history, historyIndex],
  )

  const onUndo = useCallback(() => {
    console.log("Undo triggered")
    handleUndo(historyIndex, setHistoryIndex, history, setBricks)
  }, [history, historyIndex])

  const onRedo = useCallback(() => {
    console.log("Redo triggered")
    handleRedo(historyIndex, setHistoryIndex, history, setBricks)
  }, [history, historyIndex])

  const onClearSet = useCallback(() => {
    console.log("Clear set triggered")
    handleClearSet(setBricks, setHistory, setHistoryIndex)
    // Close the modal
    setShowClearModal(false)
  }, [])

  const handleClearWithConfirmation = useCallback(() => {
    if (bricks.length > 0) {
      setShowClearModal(true)
    }
  }, [bricks.length])

  const onPlayToggle = useCallback(() => {
    console.log("Play toggle triggered")
    handlePlayToggle(isPlaying, setIsPlaying)
  }, [isPlaying])

  const handleModeChange = useCallback((mode: "build" | "move" | "erase") => {
    setInteractionMode(mode)

    // Clear hovered user when changing modes
    if (mode !== "move") {
      setHoveredUser(null)
    }
  }, [])

  const handleCanvasResize = useCallback((size: number) => {
    const newSize = updateGridSize(size)
    console.log(`Canvas resized to ${newSize}x${newSize}`)

    // Send message for real-time updates
    sendMessage({
      type: MessageType.CANVAS_RESIZE,
      size: newSize,
    })
  }, [])

  const handleUserHover = useCallback((user: User | null, position: { x: number; y: number }) => {
    setHoveredUser(user)
    setHoveredUserPosition(position)
  }, [])

  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    isPlaying,
    width,
    depth,
    currentColors,
    setWidth,
    setDepth,
    setSelectedColor,
    setInteractionMode,
    onUndo,
    onRedo,
    onPlayToggle,
    handleClearWithConfirmation,
    handleSave: () => {}, // Empty function since we removed save functionality
    handleLoad: () => {}, // Empty function since we removed load functionality
    currentTheme,
    handleThemeChange,
  })

  return (
    <div
      className="fixed inset-0 w-full h-full bg-purple-950 font-sans overflow-hidden"
      onContextMenu={(e) => e.preventDefault()} // Prevent context menu on right-click
    >
      <Canvas shadows camera={{ position: [0, 15, 15], fov: 50 }}>
        <Scene
          bricks={bricks}
          selectedColor={selectedColor}
          width={width}
          depth={depth}
          onAddBrick={onAddBrick}
          onDeleteBrick={onDeleteBrick}
          onUndo={onUndo}
          onRedo={onRedo}
          isPlaying={isPlaying}
          interactionMode={interactionMode}
          isInCooldown={isInCooldown}
          timeRemaining={timeRemaining}
          totalTime={totalTime}
          brickUsers={brickUsers}
          users={users}
          onUserHover={handleUserHover}
        />
        <OrbitControls
          ref={orbitControlsRef}
          target={[0, 0, 0]}
          minPolarAngle={0}
          maxPolarAngle={Math.PI / 2}
          minDistance={10} // Minimum zoom distance
          maxDistance={40} // Maximum zoom distance
          autoRotate={isPlaying}
          autoRotateSpeed={1}
          enableZoom={!isPlaying && interactionMode === "move"}
          enablePan={!isPlaying && interactionMode === "move"}
          enableRotate={!isPlaying && interactionMode === "move"}
        />
      </Canvas>

      {/* Settings button */}
      <button
        onClick={() => setShowResizeModal(true)}
        className="fixed top-4 left-20 z-50 bg-black/70 rounded-full p-2 text-white"
        aria-label="Canvas Settings"
      >
        <Settings className="w-5 h-5" />
      </button>

      {!isPlaying && (
        <>
          <ActionToolbar onModeChange={handleModeChange} currentMode={interactionMode} />
          <ColorSelector
            colors={currentColors}
            selectedColor={selectedColor}
            onSelectColor={handleSelectColor}
            onUndo={onUndo}
            onRedo={onRedo}
            canUndo={historyIndex > 0}
            canRedo={historyIndex < history.length - 1}
            width={width}
            depth={depth}
            onWidthChange={setWidth}
            onDepthChange={setDepth}
            onClearSet={handleClearWithConfirmation}
            onPlayToggle={onPlayToggle}
            isPlaying={isPlaying}
            onSave={() => {}} // Empty function since we removed save functionality
            onLoad={() => {}} // Empty function since we removed load functionality
            currentTheme={currentTheme}
            onThemeChange={handleThemeChange}
            bricksCount={bricks.length}
          />
          <AudioPlayer />
          {isInCooldown && <CooldownIndicator remainingTime={cooldownRemaining} />}

          {/* User hover card */}
          <UserHoverCard
            user={hoveredUser}
            position={hoveredUserPosition}
            visible={interactionMode === "move" && hoveredUser !== null}
          />
        </>
      )}
      {isPlaying && (
        <button
          onClick={onPlayToggle}
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white hover:text-gray-300 transition-colors"
          aria-label="Stop"
        >
          <Pause className="w-8 h-8 stroke-[1.5]" />
        </button>
      )}

      {/* Modals */}
      <ClearConfirmationModal isOpen={showClearModal} onClose={() => setShowClearModal(false)} onClear={onClearSet} />
      <CanvasResizeModal
        isOpen={showResizeModal}
        onClose={() => setShowResizeModal(false)}
        onResize={handleCanvasResize}
        currentSize={GRID_SIZE}
        maxSize={MAX_GRID_SIZE}
      />
    </div>
  )
}

