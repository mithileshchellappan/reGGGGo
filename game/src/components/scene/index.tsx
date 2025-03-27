"use client"

import type React from "react"
import { useState } from "react"
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
import { FPVControls } from "./fpv-controls"

interface ExtendedSceneProps extends SceneProps {
  selectedBlockType: BlockType
  selectedSpecialImage: string
  isSpecialLocked: boolean
  cameraMode?: "orbit" | "fpv"
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
  selectedBlockType,
  selectedSpecialImage,
  isSpecialLocked,
  cameraMode = "orbit",
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

      {/* Camera controls - either OrbitControls or FPVControls based on mode */}
      {cameraMode === "orbit" ? (
        <OrbitControls
          makeDefault
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={100}
        />
      ) : (
        <FPVControls enabled={!isPlaying} />
      )}

      {/* Render all bricks */}
      {bricks.map((brick, index) => {
        // Use appropriate block component based on brick type
        const isHovered = hoveredBrickIndex === index && (interactionMode === "erase" || interactionMode === "move")

        // Check for blockType property
        const blockType = brick.blockType || "regular"

        if (blockType === "special" && brick.imageId) {
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
              imageId={brick.imageId}
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

