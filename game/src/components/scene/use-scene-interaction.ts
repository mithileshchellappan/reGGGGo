"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import * as THREE from "three"
import { useFrame, useThree } from "@react-three/fiber"
import { GRID_SIZE, BRICK_HEIGHT, LAYER_GAP, GROUND_HEIGHT } from "../../lib/constants"
import type { Brick,  } from "../v0-blocks/events"
import type { ThreeEvent } from "@react-three/fiber"
import { v4 as uuidv4 } from 'uuid'

interface UseSceneInteractionProps {
  bricks: Brick[]
  width: number
  depth: number
  selectedColor: string
  onAddBrick: (brick: Brick) => void
  onDeleteBrick?: (brick: Brick, index: number) => void
  onUpdateBrick?: (index: number, newPosition: [number, number, number]) => void
  isPlaying: boolean
  interactionMode: "build" | "move" | "erase"
  isInCooldown?: boolean
}

export function useSceneInteraction({
  bricks,
  width,
  depth,
  selectedColor,
  onAddBrick,
  onDeleteBrick,
  onUpdateBrick,
  isPlaying,
  interactionMode,
  isInCooldown = false,
}: UseSceneInteractionProps) {
  const [currentBrickPosition, setCurrentBrickPosition] = useState<[number, number, number]>([
    0,
    GROUND_HEIGHT / 2 + BRICK_HEIGHT / 2,
    0,
  ])
  const [isPlacing, setIsPlacing] = useState(true)
  const [isValid, setIsValid] = useState(true)
  const [showNewBrick, setShowNewBrick] = useState(true)
  const [hoveredBrickIndex, setHoveredBrickIndex] = useState<number | null>(null)
  const [touchedBrickIndex, setTouchedBrickIndex] = useState<number | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isAddingBrick, setIsAddingBrick] = useState(false)
  const [isMovingBrick, setIsMovingBrick] = useState(false)
  const [selectedBrickIndex, setSelectedBrickIndex] = useState<number | null>(null)
  const [dragPlaneRef, setDragPlaneRef] = useState<THREE.Mesh | null>(null)

  // Generate a consistent ID for the preview brick display only
  // Note: When actually placing a brick, we'll generate a new unique ID
  const previewBrickId = useMemo(() => uuidv4(), []);

  // Touch interaction tracking
  const [touchStartPosition, setTouchStartPosition] = useState<{ x: number; y: number } | null>(null)
  const [hasMoved, setHasMoved] = useState(false)
  const touchMoveThreshold = 10 // pixels

  const { camera, raycaster, mouse, gl } = useThree()
  const planeRef = useRef<THREE.Mesh>(null)
  const movementPlaneRef = useRef<THREE.Mesh>(null)
  
  // Store the initial position of the brick being moved
  const initialBrickPosition = useRef<[number, number, number] | null>(null)

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Reset hovered brick index when bricks array changes (after deletion)
  useEffect(() => {
    if (isDeleting) {
      setHoveredBrickIndex(null)
      setTouchedBrickIndex(null)
      setIsDeleting(false)
    }
  }, [bricks, isDeleting])

  // Reset hovered brick index when interaction mode changes
  useEffect(() => {
    setHoveredBrickIndex(null)
    setTouchedBrickIndex(null)
    setSelectedBrickIndex(null)
    setIsMovingBrick(false)

    // Reset the plane's raycast behavior when switching modes
    if (planeRef.current) {
      if (interactionMode === "build") {
        // Restore the original raycast function for build mode
        if ((planeRef.current as any)._originalRaycast) {
          planeRef.current.raycast = (planeRef.current as any)._originalRaycast
          ;(planeRef.current as any)._originalRaycast = null
        }
      } else {
        // Store the original raycast function if not already stored
        if (!(planeRef.current as any)._originalRaycast) {
          const originalRaycast = planeRef.current.raycast
          ;(planeRef.current as any)._originalRaycast = originalRaycast

          // Set a dummy raycast function that does nothing for non-build modes
          planeRef.current.raycast = () => {}
        }
      }
    }
  }, [interactionMode])

  const snapToGrid = (value: number, size: number) => {
    const isOdd = size % 2 !== 0
    const snappedValue = Math.round(value)
    return isOdd ? snappedValue - 0.5 : snappedValue
  }

  const isValidPlacement = (position: [number, number, number], width: number, depth: number) => {
    // Get the current grid size value directly
    const currentGridSize = GRID_SIZE

    const [x, y, z] = position
    const left = Math.floor(x - width / 2)
    const right = Math.ceil(x + width / 2)
    const top = Math.floor(z - depth / 2)
    const bottom = Math.ceil(z + depth / 2)

    if (
      left < -currentGridSize / 2 ||
      right > currentGridSize / 2 ||
      top < -currentGridSize / 2 ||
      bottom > currentGridSize / 2
    ) {
      return false
    }

    return !bricks.some((brick, index) => {
      // Skip checking against the brick we're currently moving
      if (interactionMode === "move" && index === selectedBrickIndex) {
        return false
      }
      
      const brickLeft = Math.floor(brick.position[0] - brick.width / 2)
      const brickRight = Math.ceil(brick.position[0] + brick.width / 2)
      const brickTop = Math.floor(brick.position[2] - brick.height / 2)
      const brickBottom = Math.ceil(brick.position[2] + brick.height / 2)

      const horizontalOverlap = left < brickRight && right > brickLeft
      const verticalOverlap = top < brickBottom && bottom > brickTop
      const sameLayer = Math.abs(y - brick.position[1]) < 0.1

      return horizontalOverlap && verticalOverlap && sameLayer
    })
  }

  const findHighestBrick = (x: number, z: number, width: number, depth: number) => {
    const relevantBricks = bricks.filter((brick) => {
      const horizontalOverlap = Math.abs(brick.position[0] - x) < (width + brick.width) / 2
      const verticalOverlap = Math.abs(brick.position[2] - z) < (depth + brick.height) / 2
      return horizontalOverlap && verticalOverlap
    })

    if (relevantBricks.length === 0) return GROUND_HEIGHT / 2 + BRICK_HEIGHT / 2

    return Math.max(...relevantBricks.map((brick) => brick.position[1])) + BRICK_HEIGHT + LAYER_GAP
  }

  // Find the brick at the current pointer position
  const findBrickAtPointer = () => {
    // Create a temporary array to store distances to each brick
    const intersectedBricks: { index: number; distance: number }[] = []

    // Check for intersections with each brick
    bricks.forEach((brick, index) => {
      // Create a box that represents the brick for intersection testing
      const brickBox = new THREE.Box3().setFromCenterAndSize(
        new THREE.Vector3(brick.position[0], brick.position[1], brick.position[2]),
        new THREE.Vector3(brick.width, BRICK_HEIGHT, brick.height),
      )

      // Check if the ray intersects the brick box
      const intersectionPoint = new THREE.Vector3()
      if (raycaster.ray.intersectBox(brickBox, intersectionPoint)) {
        // Calculate distance from camera to intersection point
        const distance = raycaster.ray.origin.distanceTo(intersectionPoint)
        intersectedBricks.push({ index, distance })
      }
    })

    // Sort by distance and return the closest brick (not the furthest)
    if (intersectedBricks.length > 0) {
      intersectedBricks.sort((a, b) => a.distance - b.distance)
      return intersectedBricks[0].index
    }

    return null
  }

  // Create an invisible movement plane at the same height as the selected brick
  const createMovementPlane = (yPosition: number) => {
    if (!movementPlaneRef.current) return
    
    movementPlaneRef.current.position.y = yPosition
    movementPlaneRef.current.visible = false
    
    // Make sure the plane is active for raycasting
    if ((movementPlaneRef.current as any)._originalRaycast) {
      movementPlaneRef.current.raycast = (movementPlaneRef.current as any)._originalRaycast
    }
  }

  useFrame(() => {
    // Skip raycaster calculations when in play mode or when deleting
    if (isPlaying || isDeleting) return

    // Set up raycaster
    raycaster.setFromCamera(mouse, camera)

    // Handle build mode
    if (interactionMode === "build" && isPlacing && planeRef.current) {
      const intersects = raycaster.intersectObject(planeRef.current)

      if (intersects.length > 0) {
        const { x, z } = intersects[0].point
        const snappedX = snapToGrid(x, width)
        const snappedZ = snapToGrid(z, depth)
        const highestPoint = findHighestBrick(snappedX, snappedZ, width, depth)
        const newPosition: [number, number, number] = [snappedX, highestPoint, snappedZ]

        setCurrentBrickPosition(newPosition)
        setIsValid(isValidPlacement(newPosition, width, depth))
      }
    }

    // Handle move mode - update brick position when dragging
    if (interactionMode === "move" && isMovingBrick && selectedBrickIndex !== null && movementPlaneRef.current) {
      const intersects = raycaster.intersectObject(movementPlaneRef.current)
      
      if (intersects.length > 0 && onUpdateBrick) {
        const { x, z } = intersects[0].point
        const brick = bricks[selectedBrickIndex]
        
        // Snap to grid
        const snappedX = snapToGrid(x, brick.width)
        const snappedZ = snapToGrid(z, brick.height)
        
        // Keep the same y position
        const newPosition: [number, number, number] = [snappedX, brick.position[1], snappedZ]
        
        // Check if the position is valid
        const isValid = isValidPlacement(newPosition, brick.width, brick.height)
        
        if (isValid) {
          // Update the brick position locally without changing the data yet
          // (we'll update the data when the drag ends)
          onUpdateBrick(selectedBrickIndex, newPosition)
        }
      }
    }

    // Handle erase mode or move mode - check for brick intersections
    if ((interactionMode === "erase" || interactionMode === "move") && !isDeleting && !touchedBrickIndex && !isMobile && !isMovingBrick) {
      // Reset hovered brick index
      const prevHoveredIndex = hoveredBrickIndex
      setHoveredBrickIndex(null)

      // Find brick at pointer
      const brickIndex = findBrickAtPointer()
      if (brickIndex !== null) {
        setHoveredBrickIndex(brickIndex)
      } else if (interactionMode === "move" && prevHoveredIndex !== null) {
        // Clear hover if we're not hovering over any brick
        setHoveredBrickIndex(null)
      }
    }
  })

  const handleClick = (event: ThreeEvent<MouseEvent>) => {
    // Prevent default behavior to avoid unintended actions
    event.stopPropagation()

    if (isPlaying || isAddingBrick) return

    if (interactionMode === "build" && isPlacing && isValid && showNewBrick) {
      if (isInCooldown) {
        // Don't add brick if in cooldown
        console.log("In cooldown, can't add brick yet")
        return
      }

      // Set flag to prevent duplicate placement
      setIsAddingBrick(true)

      // Generate a new UUID for the actual brick placement
      const newBrickId = `${currentBrickPosition[0]}-${currentBrickPosition[1]}-${currentBrickPosition[2]}`
      if(bricks.some((brick) => brick.id === newBrickId)) {
        setIsAddingBrick(false)
        return
      }
      console.log("Placing brick with new ID:", newBrickId);
      onAddBrick({ id: newBrickId, color: selectedColor, position: currentBrickPosition, width, height: depth })
      
      // Reset the flag after a short delay
      setTimeout(() => {
        setIsAddingBrick(false)
      }, 100)
    }
  }

  // Touch handlers for mobile
  const handleTouchStart = (event: ThreeEvent<PointerEvent>) => {
    if (isPlaying) return

    // Record the starting position for all modes
    setTouchStartPosition({ x: event.clientX, y: event.clientY })
    setHasMoved(false)

    if (interactionMode === "erase" && isMobile) {
      // For erase mode on mobile, we'll check for brick deletion in handleTouchEnd
      // to avoid accidental deletions when trying to rotate the camera
      raycaster.setFromCamera(mouse, camera)
      const brickIndex = findBrickAtPointer()
      if (brickIndex !== null) {
        setTouchedBrickIndex(brickIndex)
      }
    } else if (interactionMode === "erase" && !isMobile) {
      // For erase mode on desktop, find and highlight the brick on touch start
      raycaster.setFromCamera(mouse, camera)
      const brickIndex = findBrickAtPointer()
      if (brickIndex !== null) {
        setTouchedBrickIndex(brickIndex)
      }
    } else if (interactionMode === "move" && !isMovingBrick) {
      // For move mode, find and select the brick on touch start
      raycaster.setFromCamera(mouse, camera)
      const brickIndex = findBrickAtPointer()
      
      if (brickIndex !== null) {
        setSelectedBrickIndex(brickIndex)
        setIsMovingBrick(true)
        
        // Store initial position in case we need to revert
        initialBrickPosition.current = [...bricks[brickIndex].position] as [number, number, number]
        
        // Create a movement plane at the same height as the selected brick
        createMovementPlane(bricks[brickIndex].position[1])
      }
    }
  }

  const handleTouchMove = (event: ThreeEvent<PointerEvent>) => {
    if (isPlaying) return

    if (touchStartPosition) {
      // Calculate distance moved
      const dx = event.clientX - touchStartPosition.x
      const dy = event.clientY - touchStartPosition.y
      const distance = Math.sqrt(dx * dx + dy * dy)

      // If moved more than threshold, mark as moved
      if (distance > touchMoveThreshold) {
        setHasMoved(true)
      }
    }

    if (interactionMode === "erase" && !isMobile) {
      // For erase mode on desktop, update the highlighted brick if the pointer moves
      raycaster.setFromCamera(mouse, camera)
      const brickIndex = findBrickAtPointer()

      // Only update if we're not already touching a brick or if we've moved to a different brick
      if (touchedBrickIndex === null || brickIndex !== touchedBrickIndex) {
        setTouchedBrickIndex(brickIndex)
      }
    }
    
    // Move mode doesn't need special handling here - the useFrame handles the movement
  }

  const handleTouchEnd = (event: ThreeEvent<PointerEvent>) => {
    if (isPlaying) return

    if (interactionMode === "build") {
      // If didn't move (or moved very little), consider it a tap to place a brick
      if (touchStartPosition && !hasMoved && isValid && showNewBrick && !isAddingBrick) {
        if (isInCooldown) {
          // Don't add brick if in cooldown
          console.log("In cooldown, can't add brick yet")
          return
        }

        // Set flag to prevent duplicate placement
        setIsAddingBrick(true)

        // Generate a new UUID for the actual brick placement on mobile
        const newBrickId = `${currentBrickPosition[0]}-${currentBrickPosition[1]}-${currentBrickPosition[2]}`
        if(bricks.some((brick) => brick.id === newBrickId)) {
          setIsAddingBrick(false)
          return
        }
        console.log("Placing brick with new ID (mobile):", newBrickId, bricks);
        
        onAddBrick({ id: newBrickId, color: selectedColor, position: currentBrickPosition, width, height: depth })
        
        // Reset the flag after a short delay
        setTimeout(() => {
          setIsAddingBrick(false)
        }, 100)
      }
    } else if (interactionMode === "erase" && touchedBrickIndex !== null) {
      // For erase mode, delete the brick on touch end if we didn't move much
      if (!hasMoved && onDeleteBrick) {
        console.log(`use-scene-interaction line 373 Deleting brick at index: ${touchedBrickIndex}, brick: ${bricks[touchedBrickIndex]}`);
        setIsDeleting(true)
        onDeleteBrick(bricks[touchedBrickIndex], touchedBrickIndex)
      }
    } else if (interactionMode === "move" && isMovingBrick && selectedBrickIndex !== null) {
      // For move mode, finish the drag operation
      setIsMovingBrick(false)
      
      // Disable the movement plane
      if (movementPlaneRef.current && (movementPlaneRef.current as any)._originalRaycast) {
        const dummyRaycast = () => {}
        movementPlaneRef.current.raycast = dummyRaycast
      }
      
      // Clear the selected brick index
      setSelectedBrickIndex(null)
      initialBrickPosition.current = null
    }

    // Reset touch tracking
    setTouchStartPosition(null)
    setHasMoved(false)
    setTouchedBrickIndex(null)
  }

  const handleBrickClick = (brick: Brick, index: number) => {
    if (isPlaying || isDeleting) return

    if (interactionMode === "erase" && onDeleteBrick) {
      console.log(`🖱️ Brick clicked for deletion at index: ${index}`);
      
      // Set deleting flag to prevent hover effects during deletion
      setIsDeleting(true)
      // Clear the hovered brick index immediately
      setHoveredBrickIndex(null)
      // Delete the brick
      onDeleteBrick(brick, index)
    }
  }

  // Update the plane's raycast behavior when isPlaying changes
  useEffect(() => {
    if (planeRef.current) {
      if (isPlaying) {
        // Store the original raycast function
        const originalRaycast = planeRef.current.raycast
        ;(planeRef.current as any)._originalRaycast = originalRaycast

        // Set a dummy raycast function that does nothing
        planeRef.current.raycast = () => {}
      } else if ((planeRef.current as any)._originalRaycast && interactionMode === "build") {
        // Only restore for build mode and when not playing
        planeRef.current.raycast = (planeRef.current as any)._originalRaycast
        ;(planeRef.current as any)._originalRaycast = null
      }
    }
  }, [isPlaying, interactionMode])

  // Add keyboard shortcut for toggling brick visibility
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isPlaying) return // Disable keyboard controls when playing

      if (event.key === "h" || event.key === "H") {
        setShowNewBrick((prev) => !prev)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isPlaying])

  return {
    currentBrickPosition,
    isValid,
    showNewBrick,
    hoveredBrickIndex: isMobile ? null : hoveredBrickIndex, // Never show hover effect on mobile
    touchedBrickIndex,
    handleClick,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleBrickClick,
    planeRef,
    movementPlaneRef,
    previewBrickId,
    isMovingBrick,
    selectedBrickIndex,
  }
}

