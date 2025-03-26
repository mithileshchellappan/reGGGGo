"use client"

import { useEffect, useRef } from "react"
import { useThree, useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface FPVControlsProps {
  enabled?: boolean
}

export const FPVControls: React.FC<FPVControlsProps> = ({ enabled = true }) => {
  const { camera } = useThree()
  const keysPressed = useRef({
    w: false,
    a: false,
    s: false,
    d: false,
    shift: false,
    q: false, // For moving up
    e: false, // For moving down
  })
  const cameraSpeed = useRef(0.5)

  // Set up key event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only record key presses if controls are enabled
      if (!enabled) return

      // Skip if any modifier keys are pressed (except shift)
      if (e.ctrlKey || e.altKey || e.metaKey) return
      
      // Prevent default behavior for movement keys to avoid page scrolling
      if (['w', 'a', 's', 'd', 'W', 'A', 'S', 'D', 'q', 'e', 'Q', 'E'].includes(e.key)) {
        e.preventDefault()
      }

      if (e.key === "w" || e.key === "W") keysPressed.current.w = true
      if (e.key === "a" || e.key === "A") keysPressed.current.a = true
      if (e.key === "s" || e.key === "S") keysPressed.current.s = true
      if (e.key === "d" || e.key === "D") keysPressed.current.d = true
      if (e.key === "q" || e.key === "Q") keysPressed.current.q = true
      if (e.key === "e" || e.key === "E") keysPressed.current.e = true
      if (e.key === "Shift") keysPressed.current.shift = true
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "w" || e.key === "W") keysPressed.current.w = false
      if (e.key === "a" || e.key === "A") keysPressed.current.a = false
      if (e.key === "s" || e.key === "S") keysPressed.current.s = false
      if (e.key === "d" || e.key === "D") keysPressed.current.d = false
      if (e.key === "q" || e.key === "Q") keysPressed.current.q = false
      if (e.key === "e" || e.key === "E") keysPressed.current.e = false
      if (e.key === "Shift") keysPressed.current.shift = false
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [enabled])

  // Update camera position on each frame
  useFrame(() => {
    if (!enabled) return

    // Speed boost with shift key
    const currentSpeed = keysPressed.current.shift ? cameraSpeed.current * 2 : cameraSpeed.current

    // Create direction vectors for horizontal movement
    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion).multiplyScalar(currentSpeed)
    // Zero out the y component to keep movement horizontal
    forward.y = 0
    forward.normalize().multiplyScalar(currentSpeed)
    
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion).multiplyScalar(currentSpeed)
    right.y = 0
    right.normalize().multiplyScalar(currentSpeed)

    // Vertical movement (fixed up/down direction)
    const up = new THREE.Vector3(0, 1, 0).multiplyScalar(currentSpeed)

    // Apply movement based on keys pressed
    if (keysPressed.current.w) camera.position.add(forward)
    if (keysPressed.current.s) camera.position.sub(forward)
    if (keysPressed.current.a) camera.position.sub(right)
    if (keysPressed.current.d) camera.position.add(right)
    if (keysPressed.current.q) camera.position.add(up)
    if (keysPressed.current.e) camera.position.sub(up)
  })

  return null
} 