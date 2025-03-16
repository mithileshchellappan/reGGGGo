"use client"

import type React from "react"
import { Environment, SoftShadows } from "@react-three/drei"
import type { SceneProps } from "./types"
import { LargePlane } from "../large-plane"
import { Platform } from "../platform"
import { BuildMode } from "./build-mode"
import { EraseMode } from "./erase-mode"
import { LightingSetup } from "./lighting-setup"
import { useSceneInteraction } from "./use-scene-interaction"
import { Block } from "../block"
import { GRID_SIZE } from "../../lib/constants"
import { ClockAnimation } from "../clock-animation"

export const Scene: React.FC<SceneProps> = ({
  bricks,
  selectedColor,
  width,
  depth,
  onAddBrick,
  onDeleteBrick,
  onUndo,
  onRedo,
  isPlaying,
  interactionMode = "build",
  isInCooldown = false,
  timeRemaining = 0,
  totalTime = 0,
  brickUsers = [],
  users = [],
  onUserHover,
}) => {
  const {
    currentBrickPosition,
    isValid,
    showNewBrick,
    hoveredBrickIndex,
    handleClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleBrickClick,
    planeRef,
    previewBrickId,
  } = useSceneInteraction({
    bricks,
    width,
    depth,
    selectedColor,
    onAddBrick,
    onDeleteBrick,
    isPlaying,
    interactionMode,
    isInCooldown,
    brickUsers,
    users,
    onUserHover,
  })

  return (
    <>
      <SoftShadows size={25} samples={16} focus={0.5} />
      <LargePlane />
      <Platform />

      {/* Render all bricks */}
      {bricks.map((brick, index) => (
        <Block
          key={index}
          id={brick.id}
          color={brick.color}
          position={brick.position}
          width={brick.width}
          height={brick.height}
          isPlacing={hoveredBrickIndex === index && (interactionMode === "erase" || interactionMode === "move")}
          onClick={() => handleBrickClick(index)}
        />
      ))}

      {/* Render appropriate mode components */}
      {interactionMode === "build" && !isPlaying && (
        <BuildMode
          showNewBrick={showNewBrick}
          isValid={isValid}
          currentBrickPosition={currentBrickPosition}
          selectedColor={selectedColor}
          width={width}
          depth={depth}
          previewBrickId={previewBrickId}
        />
      )}

      {interactionMode === "erase" && !isPlaying && <EraseMode />}

      {/* Clock animation */}
      {false && timeRemaining > 0 && (
        <ClockAnimation timeRemaining={timeRemaining} totalTime={totalTime} position={[0, 15, -GRID_SIZE / 2 - 5]} />
      )}

      {/* The plane is always present but only interactive when not playing and in build mode */}
      <mesh
        ref={planeRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        onClick={handleClick}
        onPointerDown={handleTouchStart}
        onPointerMove={handleTouchMove}
        onPointerUp={handleTouchEnd}
        onPointerLeave={handleTouchEnd}
      >
        <planeGeometry args={[GRID_SIZE, GRID_SIZE]} />
        <meshBasicMaterial visible={false} />
      </mesh>

      <LightingSetup />
      <Environment
        files="assets/textures/bg-image-gradient.jpeg"
        background
      />
    </>
  )
}

