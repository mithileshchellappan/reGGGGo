"use client"

import type React from "react"
import { Environment, SoftShadows, OrbitControls } from "@react-three/drei"
import type { SceneProps } from "./types"
import { LargePlane } from "../large-plane"
import { Platform } from "../platform"
import { BuildMode } from "./build-mode"
import { EraseMode } from "./erase-mode"
import { LightingSetup } from "./lighting-setup"
import { useSceneInteraction } from "./use-scene-interaction"
import { Block } from "../block"
import { ImageBlock } from "../block/image-block"
import { GRID_SIZE } from "../../lib/constants"
import { ClockAnimation } from "../clock-animation"
import type { BlockType } from "../block/types"

interface ExtendedSceneProps extends SceneProps {
  selectedBlockType: BlockType
  selectedSpecialImage: string
  isSpecialLocked: boolean
}

export const Scene: React.FC<ExtendedSceneProps> = ({
  bricks,
  selectedColor,
  width,
  depth,
  onAddBrick,
  onDeleteBrick,
  isPlaying,
  interactionMode = "build",
  isInCooldown = false,
  timeRemaining = 0,
  totalTime = 0,
  selectedBlockType,
  selectedSpecialImage,
  isSpecialLocked,
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
  })

  return (
    <>
      <SoftShadows size={25} samples={16} focus={0.5} />
      <LargePlane />
      <Platform />

      {/* Orbit controls for camera rotation */}
      <OrbitControls
        makeDefault
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={5}
        maxDistance={50}
      />

      {/* Render all bricks */}
      {bricks.map((brick, index) => {
        // Use appropriate block component based on brick type
        const isHovered = hoveredBrickIndex === index && (interactionMode === "erase" || interactionMode === "move")

        // Check for blockType property
        const blockType = brick.blockType || "regular"

        // If it's special and has imageUrl, use ImageBlock, otherwise use regular Block
        if (blockType === "special" && brick.imageUrl) {
          return (
            <ImageBlock
              key={index}
              color={brick.color}
              position={brick.position}
              width={brick.width}
              height={brick.height}
              username={brick.username}
              isPlacing={isHovered}
              onClick={() => handleBrickClick(brick, index)}
              imageUrl={brick.imageUrl}
            />
          )
        } else {
          return (
            <Block
              key={index}
              color={brick.color}
              position={brick.position}
              width={brick.width}
              height={brick.height}
              username={brick.username}
              isPlacing={isHovered}
              onClick={() => handleBrickClick(brick,index)}
            />
          )
        }
      })}

      {/* Render appropriate mode components */}
      {interactionMode === "build" && !isPlaying && (
        <BuildMode
          showNewBrick={showNewBrick}
          isValid={isValid}
          currentBrickPosition={currentBrickPosition}
          selectedColor={selectedColor}
          width={width}
          depth={depth}
          selectedBlockType={selectedBlockType}
          selectedSpecialImage={selectedSpecialImage}
          isSpecialLocked={isSpecialLocked}
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

