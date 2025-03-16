"use client"

import { useRef, useState } from "react"
import { useFrame } from "@react-three/fiber"
import { Block } from "../block"
import * as THREE from "three"

export const LoadingBrick = () => {
  const [rotationY, setRotationY] = useState(0)
  const [positionY, setPositionY] = useState(0)
  const [color, setColor] = useState("#5D3FD3")
  const groupRef = useRef<THREE.Group>(null)

  // Animate the brick
  useFrame((state) => {
    // Update position and rotation
    const newY = Math.sin(state.clock.elapsedTime * 1.5) * 0.1
    setPositionY(newY)
    setRotationY(state.clock.elapsedTime * 0.5)
    
    // Update color for rainbow effect
    const hue = (state.clock.getElapsedTime() * 0.05) % 1
    const newColor = `hsl(${hue * 360}, 70%, 50%)`
    setColor(newColor)
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
      <Block 
        color={color}
        position={[0, positionY, 0]}
        width={2}
        height={2}
        isPlacing={true} 
      />
    </group>
  )
} 