"use client"

import type React from "react"
import { useRef } from "react"
import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"

export const LightingSetup: React.FC = () => {
  const { camera } = useThree()
  const directionalLightRef = useRef<THREE.DirectionalLight>(null)

  useFrame(() => {
    // Update directional light to follow camera somewhat
    if (directionalLightRef.current) {
      const lightPos = new THREE.Vector3(
        camera.position.x * 0.5 + 5,
        Math.max(8, camera.position.y * 0.5),
        camera.position.z * 0.5 + 5,
      )
      directionalLightRef.current.position.copy(lightPos)
      directionalLightRef.current.lookAt(0, 0, 0)
    }
  })

  return (
    <>
      {/* Higher ambient light for more even illumination */}
      <ambientLight intensity={0.6} />

      {/* Main directional light - softer */}
      <directionalLight
        ref={directionalLightRef}
        position={[10, 12, 8]}
        intensity={0.25}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0001}
      />

      <directionalLight position={[-8, 5, -8]} intensity={0.2} castShadow={false} />
      <directionalLight position={[8, 6, -8]} intensity={0.2} castShadow={false} />
      <directionalLight position={[-8, 6, 8]} intensity={0.2} castShadow={false} />
      
      <directionalLight position={[0, -5, 0]} intensity={0.1} castShadow={false} />
      
      <pointLight position={[10, 10, 10]} intensity={0.15} distance={30} decay={2} />
      <pointLight position={[-10, 10, -10]} intensity={0.15} distance={30} decay={2} />
      <pointLight position={[10, 10, -10]} intensity={0.15} distance={30} decay={2} />
      <pointLight position={[-10, 10, 10]} intensity={0.15} distance={30} decay={2} />
      
      <hemisphereLight args={["#ffffff", "#f0f0ff", 0.3]} />
    </>
  )
}

