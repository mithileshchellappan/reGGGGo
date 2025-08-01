"use client"

import type React from "react"
import { useState, useEffect } from "react"
import * as THREE from "three"
import { useTexture } from "@react-three/drei"
import { MARBLE_TEXTURES, GRID_SIZE } from "../lib/constants"

export const LargePlane: React.FC = () => {
  // Track grid size changes
  const [currentGridSize, setCurrentGridSize] = useState(GRID_SIZE)

  // Update when GRID_SIZE changes
  useEffect(() => {
    const handleGridSizeChange = (event: CustomEvent) => {
      console.log(`Large plane: Grid size changed to ${event.detail.size}`)
      setCurrentGridSize(event.detail.size)
    }

    // Initial check
    if (GRID_SIZE !== currentGridSize) {
      console.log(`Large plane: Initial grid size update to ${GRID_SIZE}`)
      setCurrentGridSize(GRID_SIZE)
    }

    // Listen for grid size changes
    window.addEventListener("gridSizeChanged", handleGridSizeChange as EventListener)

    return () => {
      window.removeEventListener("gridSizeChanged", handleGridSizeChange as EventListener)
    }
  }, [currentGridSize])

  const marbleTextures = useTexture(MARBLE_TEXTURES, (loadedTextures) => {
    Object.values(loadedTextures).forEach((texture) => {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      texture.repeat.set(1000, 1000)
    })
  })

  return (
    <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[Math.max(10000, currentGridSize * 100), Math.max(10000, currentGridSize * 100)]} />
      <meshStandardMaterial
        color="#ffffff"
        roughnessMap={marbleTextures.roughness}
        normalMap={marbleTextures.normal}
        map={marbleTextures.color}
      />
    </mesh>
  )
}

