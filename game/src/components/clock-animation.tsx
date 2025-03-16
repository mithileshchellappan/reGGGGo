"use client"

import type React from "react"

import { useRef } from "react"
import type * as THREE from "three"
import { useFrame } from "@react-three/fiber"

interface ClockAnimationProps {
  timeRemaining: number
  totalTime: number
  position?: [number, number, number]
  size?: number
  color?: string
}

export const ClockAnimation: React.FC<ClockAnimationProps> = ({
  timeRemaining,
  totalTime,
  position = [0, 10, 0],
  size = 5,
  color = "#ffffff",
}) => {
  const clockRef = useRef<THREE.Group>(null)
  const hourHandRef = useRef<THREE.Mesh>(null)
  const minuteHandRef = useRef<THREE.Mesh>(null)
  const secondHandRef = useRef<THREE.Mesh>(null)

  // Calculate the progress (0 to 1)
  const progress = Math.max(0, Math.min(1, timeRemaining / totalTime))

  // Convert progress to clock time (12 hours format)
  // Map progress from 0-1 to 0-12 hours
  const clockHours = 12 * (1 - progress)

  // Calculate hand rotations
  const hourRotation = ((clockHours % 12) / 12) * Math.PI * 2
  const minuteRotation = (((clockHours * 60) % 60) / 60) * Math.PI * 2
  const secondRotation = (((clockHours * 3600) % 60) / 60) * Math.PI * 2

  useFrame(() => {
    if (hourHandRef.current) {
      hourHandRef.current.rotation.z = -hourRotation
    }
    if (minuteHandRef.current) {
      minuteHandRef.current.rotation.z = -minuteRotation
    }
    if (secondHandRef.current) {
      secondHandRef.current.rotation.z = -secondRotation
    }
  })

  return (
    <group ref={clockRef} position={position}>
      {/* Clock face */}
      <mesh>
        <cylinderGeometry args={[size, size, 0.2, 32]} />
        <meshStandardMaterial color="#222222" />
      </mesh>

      {/* Clock face top */}
      <mesh position={[0, 0.11, 0]}>
        <cylinderGeometry args={[size - 0.1, size - 0.1, 0.02, 32]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Hour markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const x = Math.sin(angle) * (size - 0.5)
        const z = Math.cos(angle) * (size - 0.5)
        return (
          <mesh key={i} position={[x, 0.12, z]}>
            <boxGeometry args={[0.2, 0.05, 0.2]} />
            <meshStandardMaterial color="#888888" />
          </mesh>
        )
      })}

      {/* Hour hand */}
      <mesh ref={hourHandRef} position={[0, 0.15, 0]}>
        <boxGeometry args={[0.3, 0.1, size * 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Minute hand */}
      <mesh ref={minuteHandRef} position={[0, 0.2, 0]}>
        <boxGeometry args={[0.2, 0.1, size * 0.7]} />
        <meshStandardMaterial color={color} />
      </mesh>

      {/* Second hand */}
      <mesh ref={secondHandRef} position={[0, 0.25, 0]}>
        <boxGeometry args={[0.1, 0.1, size * 0.8]} />
        <meshStandardMaterial color="#ff4444" />
      </mesh>

      {/* Center pin */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.3, 16]} />
        <meshStandardMaterial color="#888888" />
      </mesh>
    </group>
  )
}

