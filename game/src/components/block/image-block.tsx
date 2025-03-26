"use client"

import type React from "react"
import { useRef, useState, useMemo } from "react"
import * as THREE from "three"
import { useFrame } from "@react-three/fiber"
import { Instances, Instance, useTexture, Html } from "@react-three/drei"
import { BRICK_HEIGHT, LAYER_GAP, STUD_HEIGHT, STUD_RADIUS, STUD_SEGMENTS, TEXTURES, SPECIAL_IMAGES } from "../../lib/constants"
import type { BlockProps } from "./types"
import type { ThreeEvent } from "@react-three/fiber"

export const ImageBlock: React.FC<BlockProps> = ({
  color,
  position,
  width,
  height,
  isPlacing = false,
  opacity = 1,
  onClick,
  username,
  imageId,
  isLocked,
}) => {
  const [isHovered, setIsHovered] = useState(false)
  const depth = height

  // Create geometries - use useMemo to avoid recreating on each render
  const blockGeometry = useMemo(() => new THREE.BoxGeometry(width, BRICK_HEIGHT - LAYER_GAP, depth), [width, depth])
  const studGeometry = useMemo(() => new THREE.CylinderGeometry(STUD_RADIUS, STUD_RADIUS, STUD_HEIGHT, STUD_SEGMENTS), [])

  // Calculate stud positions - use useMemo to avoid recalculation
  const studPositions = useMemo(() => {
    const positions = []
    for (let x = -width / 2 + 0.5; x < width / 2; x++) {
      for (let z = -depth / 2 + 0.5; z < depth / 2; z++) {
        positions.push([x, BRICK_HEIGHT / 2 - LAYER_GAP / 2 + STUD_HEIGHT / 2, z])
      }
    }
    return positions
  }, [width, depth])

  // Find the special image data for this block
  const specialImage = useMemo(() => {
    if (!imageId) return null;
    const image = SPECIAL_IMAGES.find(img => img.id === imageId);
    console.log("Special image for imageId:", imageId, "->", image);
    return image || null;
  }, [imageId]);

  // Load the textures we need
  const textureProps = useMemo(() => {
    if (!specialImage) {
      return { 
        color: TEXTURES.color,
        roughness: TEXTURES.roughness,
        normal: TEXTURES.normal
      };
    }
    
    return {
      color: specialImage.color || TEXTURES.color,
      roughness: specialImage.roughness || TEXTURES.roughness,
      normal: specialImage.normal || TEXTURES.normal,
    };
  }, [specialImage]);
  
  const textures = useTexture(textureProps);

  // Get custom material values from the special image
  const materialValues = useMemo(() => {
    return {
      roughness: specialImage?.roughnessValue !== undefined ? specialImage.roughnessValue : 0.7,
      metalness: specialImage?.metalnessValue !== undefined ? specialImage.metalnessValue : 0.3
    };
  }, [specialImage]);

  // Set up refs and state
  const brickRef = useRef<THREE.Mesh>(null)
  const studRef = useRef<THREE.InstancedMesh>(null)
  const groupRef = useRef<THREE.Group>(null)

  // Determine if this is an erase highlight
  const isEraseHighlight = isPlacing && onClick !== undefined

  // Calculate darkened color for better shadow definition - use useMemo
  const darkenedColor = useMemo(() => {
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
  }, [color, isEraseHighlight, isPlacing])

  // Create materials for each side of the brick - use useMemo for all materials
  const sideMaterials = useMemo(() => {
    console.log("Creating materials with textures:", textures);
    
    return [
      // Right side
      new THREE.MeshStandardMaterial({
        map: textures.color,
        roughnessMap: textures.roughness,
        normalMap: textures.normal,
        color: "#FFFFFF", // Use white instead of darkenedColor to show texture color
        roughness: materialValues.roughness,
        metalness: materialValues.metalness,
        emissive: isPlacing ? (isEraseHighlight ? "#ff0000" : "#ffff00") : "#000000",
        emissiveIntensity: isPlacing ? 1 : 0,
        transparent: true,
        opacity: opacity,
        alphaTest: 0.1,
      }),
      // Left side
      new THREE.MeshStandardMaterial({
        map: textures.color,
        roughnessMap: textures.roughness,
        normalMap: textures.normal,
        color: "#FFFFFF", // Use white instead of darkenedColor
        roughness: materialValues.roughness,
        metalness: materialValues.metalness,
        emissive: isPlacing ? (isEraseHighlight ? "#ff0000" : "#ffff00") : "#000000",
        emissiveIntensity: isPlacing ? 1 : 0,
        transparent: true,
        opacity: opacity,
        alphaTest: 0.1,
      }),
      // Top side
      new THREE.MeshStandardMaterial({
        map: textures.color,
        roughnessMap: textures.roughness,
        normalMap: textures.normal,
        color: "#FFFFFF", // Changed from darkenedColor to show texture's true color
        roughness: materialValues.roughness,
        metalness: materialValues.metalness,
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
        roughness: materialValues.roughness,
        metalness: materialValues.metalness,
        emissive: isPlacing ? (isEraseHighlight ? "#ff0000" : "#ffff00") : "#000000",
        emissiveIntensity: isPlacing ? 1 : 0,
        transparent: opacity < 1,
        opacity: opacity,
      }),
      // Front side
      new THREE.MeshStandardMaterial({
        map: textures.color,
        roughnessMap: textures.roughness,
        normalMap: textures.normal,
        color: "#FFFFFF", // Use white instead of darkenedColor
        roughness: materialValues.roughness,
        metalness: materialValues.metalness,
        emissive: isPlacing ? (isEraseHighlight ? "#ff0000" : "#ffff00") : "#000000",
        emissiveIntensity: isPlacing ? 1 : 0,
        transparent: true,
        opacity: opacity,
        alphaTest: 0.1,
      }),
      // Back side
      new THREE.MeshStandardMaterial({
        map: textures.color,
        roughnessMap: textures.roughness,
        normalMap: textures.normal,
        color: "#FFFFFF", // Use white instead of darkenedColor
        roughness: materialValues.roughness,
        metalness: materialValues.metalness,
        emissive: isPlacing ? (isEraseHighlight ? "#ff0000" : "#ffff00") : "#000000",
        emissiveIntensity: isPlacing ? 1 : 0,
        transparent: true,
        opacity: opacity,
        alphaTest: 0.1,
      }),
    ];
  }, [textures, darkenedColor, isPlacing, isEraseHighlight, opacity, materialValues])

  // Create a memoized stud material
  const studMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#FFFFFF", // Changed from darkenedColor to show texture's true color
    roughnessMap: textures.roughness,
    normalMap: textures.normal,
    map: textures.color,
    roughness: materialValues.roughness,
    metalness: materialValues.metalness,
    emissive: isPlacing ? (isEraseHighlight ? "#ff0000" : "#ffff00") : "#000000",
    emissiveIntensity: isPlacing ? 1 : 0,
    transparent: opacity < 1,
    opacity: opacity,
  }), [darkenedColor, textures, isPlacing, isEraseHighlight, opacity, materialValues])

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
          {...studMaterial}
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

