"use client"

import type React from "react"
import { useMemo } from "react"
import * as THREE from "three"
import { Instances, Instance } from "@react-three/drei"
import { GRID_SIZE, GROUND_HEIGHT, STUD_HEIGHT, STUD_RADIUS } from "../constants"

export const Platform: React.FC = () => {
  const studGeometry = useMemo(() => new THREE.CylinderGeometry(STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, 12), [])
  const studPositions = useMemo(() => {
    const positions: [number, number, number][] = []
    for (let x = -GRID_SIZE / 2 + 0.5; x < GRID_SIZE / 2; x++) {
      for (let z = -GRID_SIZE / 2 + 0.5; z < GRID_SIZE / 2; z++) {
        positions.push([x, GROUND_HEIGHT / 2 + STUD_HEIGHT / 2, z])
      }
    }
    return positions
  }, [])

  // Calculate the actual number of studs based on the grid loops
  const studCount = Math.ceil(GRID_SIZE) * Math.ceil(GRID_SIZE)

  return (
    <group>
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[GRID_SIZE, GROUND_HEIGHT, GRID_SIZE]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} metalness={0.1} />
      </mesh>
      <Instances geometry={studGeometry} limit={studCount}>
        <meshStandardMaterial color="#ffffff" roughness={0.8} metalness={0.1} />
        {studPositions.map((pos, index) => (
          <Instance key={index} position={pos as [number, number, number]} castShadow receiveShadow />
        ))}
      </Instances>
    </group>
  )
}

