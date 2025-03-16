"use client"

import type React from "react"
import { useMemo, useEffect, useState } from "react"
import * as THREE from "three"
import { GRID_SIZE, GROUND_HEIGHT, STUD_HEIGHT, STUD_RADIUS, STUD_SEGMENTS } from "../lib/constants"

export const Platform: React.FC = () => {
  // Track grid size changes
  const [currentGridSize, setCurrentGridSize] = useState(GRID_SIZE)

  // Update when GRID_SIZE changes
  useEffect(() => {
    const handleGridSizeChange = (event: CustomEvent) => {
      console.log(`Grid size changed event received: ${event.detail.size}`)
      setCurrentGridSize(event.detail.size)
    }

    // Initial check
    if (GRID_SIZE !== currentGridSize) {
      console.log(`Initial grid size update: ${GRID_SIZE}`)
      setCurrentGridSize(GRID_SIZE)
    }

    // Listen for grid size changes
    window.addEventListener("gridSizeChanged", handleGridSizeChange as EventListener)

    return () => {
      window.removeEventListener("gridSizeChanged", handleGridSizeChange as EventListener)
    }
  }, [currentGridSize])

  const studGeometry = useMemo(
    () => new THREE.CylinderGeometry(STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, STUD_SEGMENTS),
    [],
  )

  // Generate stud positions based on current grid size
  const studPositions = useMemo(() => {
    const positions = []
    for (let x = -currentGridSize / 2 + 0.5; x < currentGridSize / 2; x++) {
      for (let z = -currentGridSize / 2 + 0.5; z < currentGridSize / 2; z++) {
        positions.push([x, GROUND_HEIGHT / 2 + STUD_HEIGHT / 2, z])
      }
    }
    return positions
  }, [currentGridSize])


  return (
    <group>
      {/* Base platform */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[currentGridSize, GROUND_HEIGHT, currentGridSize]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Studs */}
      <group key={`studs-${currentGridSize}`}>
        {studPositions.map((pos, index) => (
          <mesh
            key={`stud-${index}-${currentGridSize}`}
            position={[pos[0], pos[1], pos[2]]}
            geometry={studGeometry}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial color="#ffffff" roughness={0.8} metalness={0.1} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

