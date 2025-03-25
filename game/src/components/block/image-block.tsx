"use client"

import type React from "react"
import { useRef, useState } from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { Instances, Instance, useTexture, Html } from "@react-three/drei"
import { BRICK_HEIGHT, LAYER_GAP, STUD_HEIGHT, STUD_RADIUS, STUD_SEGMENTS, TEXTURES } from "../../lib/constants"
import type { BlockProps } from "./types"
import type { ThreeEvent,  } from "@react-three/fiber"

export const ImageBlock: React.FC<BlockProps> = ({
  color,
  position,
  width,
  height,
  isPlacing = false,
  opacity = 1,
  onClick,
  username,
  imageUrl,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const depth = height

  // Create geometries
  const blockGeometry = new THREE.BoxGeometry(width, BRICK_HEIGHT - LAYER_GAP, depth)
  const studGeometry = new THREE.CylinderGeometry(STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, STUD_SEGMENTS)

  // Calculate stud positions
  const studPositions = []
  for (let x = -width / 2 + 0.5; x < width / 2; x++) {
    for (let z = -depth / 2 + 0.5; z < depth / 2; z++) {
      studPositions.push([x, BRICK_HEIGHT / 2 - LAYER_GAP / 2 + STUD_HEIGHT / 2, z])
    }
  }

  // Load textures
  const textures = useTexture(TEXTURES)
  const imageTexture = useTexture(imageUrl || "/assets/image-textures/moss.jpg")

  // Set up refs and state
  const brickRef = useRef<THREE.Mesh>(null)
  const studRef = useRef<THREE.InstancedMesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  // Determine if this is an erase highlight
  const isEraseHighlight = isPlacing && onClick !== undefined

  // Calculate darkened color for better shadow definition
  const darkenedColor = (() => {
    if (isEraseHighlight) return "#ff0000"
    if (isPlacing) return "#ffff00"

    const hex = color.replace("#", "")
    const r = Number.parseInt(hex.substring(0, 2), 16)
    const g = Number.parseInt(hex.substring(2, 4), 16)
    const b = Number.parseInt(hex.substring(4, 6), 16)
    const darkenFactor = 0.9
    const newR = Math.floor(r * darkenFactor)
    const newG = Math.floor(g * darkenFactor)
    const newB = Math.floor(b * darkenFactor)
    return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`
  })()

  // Create materials for each side of the brick
  const sideMaterials = [
    // Right side
    new THREE.MeshStandardMaterial({
      map: imageTexture,
      roughnessMap: textures.roughness,
      normalMap: textures.normal,
      color: "#FFFFFF", // Use white instead of darkenedColor
      roughness: 0.7,
      metalness: 0.1,
      emissive: isPlacing ? (isEraseHighlight ? "#ff0000" : "#ffff00") : "#000000",
      emissiveIntensity: isPlacing ? 1 : 0,
      transparent: true,
      opacity: opacity,
      alphaTest: 0.1,
    }),
    // Left side
    new THREE.MeshStandardMaterial({
      map: imageTexture,
      roughnessMap: textures.roughness,
      normalMap: textures.normal,
      color: "#FFFFFF", // Use white instead of darkenedColor
      roughness: 0.7,
      metalness: 0.1,
      emissive: isPlacing ? (isEraseHighlight ? "#ff0000" : "#ffff00") : "#000000",
      emissiveIntensity: isPlacing ? 1 : 0,
      transparent: true,
      opacity: opacity,
      alphaTest: 0.1,
    }),
    // Top side
    new THREE.MeshStandardMaterial({
      color: darkenedColor, // Keep color for top side (studs area)
      roughnessMap: textures.roughness,
      normalMap: textures.normal,
      map: textures.color,
      roughness: 0.7,
      metalness: 0.1,
      emissive: isPlacing ? (isEraseHighlight ? "#ff0000" : "#ffff00") : "#000000",
      emissiveIntensity: isPlacing ? 1 : 0,
      transparent: opacity < 1,
      opacity: opacity,
    }),
    // Bottom side
    new THREE.MeshStandardMaterial({
      color: darkenedColor, // Keep color for bottom side
      roughnessMap: textures.roughness,
      normalMap: textures.normal,
      map: textures.color,
      roughness: 0.7,
      metalness: 0.1,
      emissive: isPlacing ? (isEraseHighlight ? "#ff0000" : "#ffff00") : "#000000",
      emissiveIntensity: isPlacing ? 1 : 0,
      transparent: opacity < 1,
      opacity: opacity,
    }),
    // Front side
    new THREE.MeshStandardMaterial({
      map: imageTexture,
      roughnessMap: textures.roughness,
      normalMap: textures.normal,
      color: "#FFFFFF", // Use white instead of darkenedColor
      roughness: 0.7,
      metalness: 0.1,
      emissive: isPlacing ? (isEraseHighlight ? "#ff0000" : "#ffff00") : "#000000",
      emissiveIntensity: isPlacing ? 1 : 0,
      transparent: true,
      opacity: opacity,
      alphaTest: 0.1,
    }),
    // Back side
    new THREE.MeshStandardMaterial({
      map: imageTexture,
      roughnessMap: textures.roughness,
      normalMap: textures.normal,
      color: "#FFFFFF", // Use white instead of darkenedColor
      roughness: 0.7,
      metalness: 0.1,
      emissive: isPlacing ? (isEraseHighlight ? "#ff0000" : "#ffff00") : "#000000",
      emissiveIntensity: isPlacing ? 1 : 0,
      transparent: true,
      opacity: opacity,
      alphaTest: 0.1,
    }),
  ]

  // Update materials on animation frame
  useFrame((state) => {
    if (isPlacing && brickRef.current && studRef.current) {
      const glowColor = isEraseHighlight ? new THREE.Color(1, 0, 0) : new THREE.Color(1, 1, 0)
      const glowIntensity = Math.sin(state.clock.elapsedTime * 4) * 0.1 + 0.9

      if (Array.isArray(brickRef.current.material)) {
        // @ts-ignore
        brickRef.current.material.forEach((mat: THREE.MeshStandardMaterial) => {
          if (mat.emissive) {
            mat.emissive = glowColor
            mat.emissiveIntensity = glowIntensity
          }
        })
      }

      if (studRef.current.material instanceof THREE.MeshStandardMaterial) {
        studRef.current.material.emissive.copy(glowColor)
        studRef.current.material.emissiveIntensity = glowIntensity
      }
    }
  })

  const instanceLimit = Math.max(width * depth, 100)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768
  const isEraseMode = isEraseHighlight && isMobile

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (onClick) onClick()
  }

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={handleClick}
      onPointerDown={(e) => {
        if (isEraseMode && onClick) {
          e.stopPropagation()
          onClick()
        }
      }}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
    >
      <mesh ref={brickRef} geometry={blockGeometry} castShadow receiveShadow material={sideMaterials} />
      <Instances ref={studRef} geometry={studGeometry} limit={instanceLimit}>
        <meshStandardMaterial
          color={darkenedColor}
          roughnessMap={textures.roughness}
          normalMap={textures.normal}
          map={textures.color}
          roughness={0.7}
          metalness={0.1}
          emissive={isPlacing ? (isEraseHighlight ? "#ff0000" : "#ffff00") : "#000000"}
          emissiveIntensity={isPlacing ? 1 : 0}
          transparent={opacity < 1}
          opacity={opacity}
        />
        {studPositions.map((pos, index) => (
          // @ts-ignore
          <Instance key={index} position={pos} castShadow receiveShadow />
        ))}
      </Instances>

      {username && isHovered && !isPlacing && (
        <Html position={[0, BRICK_HEIGHT, 0]} center distanceFactor={10}>
          <div className="bg-black/80 text-white px-2 py-1 rounded-md text-sm whitespace-nowrap">{username}</div>
        </Html>
      )}
    </group>
  )
}

