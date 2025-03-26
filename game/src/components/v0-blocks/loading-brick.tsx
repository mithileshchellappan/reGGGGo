"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Block } from "../block"
import * as THREE from "three"
import { ImageBlock } from "../block/image-block"

export const LoadingBrick = () => {
  const [rotationY, setRotationY] = useState(0)
  const [positionY, setPositionY] = useState(0)
  const groupRef = useRef<THREE.Group>(null)

  // Animate the brick
  useFrame((state) => {
    // Update position and rotation
    const newY = Math.sin(state.clock.elapsedTime * 1.5) * 0.1
    setPositionY(newY)
    setRotationY(state.clock.elapsedTime * 0.5)
  })

  return (
    <group 
      ref={groupRef} 
      rotation={[
        Math.sin(rotationY * 0.5) * 0.15, 
        rotationY, 
        Math.cos(rotationY * 0.5) * 0.15
      ]}
    >
      <ImageBlock
        color={"#FF3333"}
        position={[0, positionY, 0]}
        width={2}
        height={2}
        isPlacing={false} 
        imageId="sci-fi"
      />
    </group>
  )
} 