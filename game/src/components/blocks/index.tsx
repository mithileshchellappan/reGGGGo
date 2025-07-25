"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { Pause, Settings } from "lucide-react"
import { Scene } from "../scene"
import { ColorSelector } from "../color-selector"
import { ActionToolbar } from "../action-toolbar"
import { ClearConfirmationModal } from "./clear-confirmation-modal"
import { useKeyboardShortcuts } from "./use-keyboard-shortcuts"
import { useColorTheme } from "./use-color-theme"
import { useTouchHandling } from "./use-touch-handling"
import { useCooldown } from "./use-cooldown"
import { CooldownIndicator } from "../cooldown-indicator"
import { LoadingBrick } from "./loading-brick"
import { DEFAULT_TIMER_DURATION, GRID_SIZE, MAX_GRID_SIZE, SpecialImage, updateGridSize } from "../../lib/constants"
import { sendMessage, onMessage, MessageType } from "../../lib/real-time"
import type { Brick } from "./events"
import type { BlockType } from "../../components/block/types"
import {
  handleAddBrick,
  handleDeleteBrick,
  handleUpdateBrick,
  handleClearSet,
  handlePlayToggle,
} from "./events"
import { useTexture } from "@react-three/drei"
import { SPECIAL_IMAGES, TEXTURES } from "../../lib/constants"
import * as THREE from "three"

export default function V0Blocks() {
  // Theme and colors
  const { currentTheme, currentColors, selectedColor, setSelectedColor, handleSelectColor, handleThemeChange } =
    useColorTheme()

  // Loading state
  const [loading, setLoading] = useState(true)

  // Camera mode state
  const [cameraMode, setCameraMode] = useState<"orbit" | "fpv">("orbit")

  // Preload textures to prevent lag when switching block types
  useEffect(() => {
    // Preload all special image textures
    const textureUrls = [
      // Collect all texture paths from special images
      ...SPECIAL_IMAGES.flatMap(img => {
        const paths = [];
        if (img.color) paths.push(img.color);
        if (img.roughness) paths.push(img.roughness);
        if (img.normal) paths.push(img.normal);
        return paths;
      }),
      ...Object.values(TEXTURES)
    ]
    
    
    // Use preload method via THREE.TextureLoader
    const loader = new THREE.TextureLoader();
    
    // Create a promise for each texture load
    const loadPromises = textureUrls.map(url => 
      new Promise((resolve, reject) => {
        loader.load(
          url, 
          (texture) => {
            resolve(texture);
          },
          undefined,
          (error) => {
            console.error(`Failed to load texture: ${url}`, error);
            reject(error);
          }
        );
      })
    );
    
    // Wait for all textures to load
    Promise.all(loadPromises)
      .then(() => console.log("All textures preloaded successfully"))
      .catch(error => console.error("Error preloading textures:", error));
      
  }, [])

  // State
  const [bricks, setBricks] = useState<Brick[]>([])
  const [username, setUsername] = useState<string>("")
  const [width, setWidth] = useState(2)
  const [depth, setDepth] = useState(2)
  const [isPlaying, setIsPlaying] = useState(false)
  const [interactionMode, setInteractionMode] = useState<"build" | "move" | "erase">("build")
  const [userPurchases, setUserPurchases] = useState<{ [key: string]: boolean }>({})
  const orbitControlsRef = useRef<any>(null)
  
  // Special block state
  const [selectedBlockType, setSelectedBlockType] = useState<BlockType>("regular")
  const [selectedSpecialImage, setSelectedSpecialImage] = useState<SpecialImage>(SPECIAL_IMAGES[0])
  const [isSpecialLocked, setIsSpecialLocked] = useState<boolean>(false)

  // Modal state
  const [showClearModal, setShowClearModal] = useState(false)
  const [showResizeModal, setShowResizeModal] = useState(false)

  // Timer state
  const [timerActive, setTimerActive] = useState(false)

  // Cooldown state
  const { isInCooldown, cooldownRemaining, startCooldown } = useCooldown(3000) // 5 seconds cooldown

  // Set up touch handling
  useTouchHandling()

  // Handle real-time messages
  useEffect(() => {
    onMessage(({message}) => {
      console.log("Received message:", message)

      switch (message.type) {
        case MessageType.INITIAL_DATA:
          const initialBricks = message.data.creation.bricks;
          setBricks(initialBricks);
          setUserPurchases({...message.data.userPurchases, moss: true});
          console.log("Initial bricks:", initialBricks)
          setUsername(message.data.username);
          updateGridSize(message.data.creation.canvasSize)
          setLoading(false);
          break;

        case MessageType.CHANNEL_BRICK_ADDED:
          // Use functional updates to get the latest state
          setBricks(currentBricks => {
            console.log("➕ CHANNEL_BRICK_ADDED received, current bricks:", currentBricks.length);
            
            // Add brick from another user
            const newBrick = message.data.brick as Brick;
            console.log("Adding new brick with ID:", newBrick.id);
            
            // Check if we already have this brick
            if (currentBricks.some(b => b.id === newBrick.id)) {
              console.log("🚫 Brick already exists, skipping:", newBrick.id);
              return currentBricks; // Return unchanged state
            }
            
            // Create a new array with the added brick
            const updatedBricks = [...currentBricks, newBrick];
            console.log("✅ Brick added, new total:", updatedBricks.length);
            
            return updatedBricks;
          });
          break;

        case MessageType.CHANNEL_BRICK_DELETED:
          setBricks(currentBricks => {
            console.log("🗑️ CHANNEL_BRICK_DELETED received for brick ID:", message.data.brickId);
            
            // Find the index of the brick with matching ID
            const brickId = message.data.brickId;
            
            // Deep log the brick array to debug
            console.log("Current bricks before deletion:", 
              currentBricks.map(b => ({ id: b.id, pos: b.position }))
            );
            
            const brickIndex = currentBricks.findIndex(brick => brick.id === brickId);
            
            if (brickIndex === -1) {
              console.log(`Brick with ID ${brickId} not found, cannot delete`);
              return currentBricks; // Return unchanged state
            }
            
            console.log(`Found brick at index ${brickIndex}, deleting...`);
            
            // Create new arrays without the brick
            const updatedBricks = [
              ...currentBricks.slice(0, brickIndex),
              ...currentBricks.slice(brickIndex + 1)
            ];
            
            return updatedBricks;
          });
          
          break;

        case MessageType.CANVAS_RESIZE:
          // Resize canvas
          const newSize = message.size as number
          updateGridSize(newSize)
          break
      }
    })
    
    // Return cleanup function to remove event listener
    return () => {
      // Clean up code here if needed
    };
  }, []) // Empty dependency array since we're using functional updates

  // Handler for selecting special images by ID
  const handleSelectSpecialImage = useCallback((imageId: string) => {
    const image = SPECIAL_IMAGES.find(img => img.id === imageId);
    if (image) {
      setSelectedSpecialImage(image);
    } else {
      console.error(`Image with ID ${imageId} not found`);
    }
  }, []);

  // Wrapper functions that call the imported event handlers with the current state
  const onAddBrick = useCallback(
    (brick: Brick) => {
      if (isInCooldown) return // Don't add brick if in cooldown
      
      // Add properties to the brick based on block type
      const brickWithProps = {
        ...brick,
        username,
        blockType: selectedBlockType,
        ...(selectedBlockType === "special" && selectedSpecialImage
          ? {
              imageId: selectedSpecialImage.id,
              isLocked: isSpecialLocked,
            }
          : {}),
      }
      
      handleAddBrick(brickWithProps, bricks, setBricks)
      startCooldown() // Start cooldown after adding a brick
    },
    [bricks, isInCooldown, startCooldown, username, selectedBlockType, selectedSpecialImage, isSpecialLocked],
  )

  const onDeleteBrick = useCallback(
    (brick: Brick, index: number) => {
      if (isInCooldown) return

      console.log(`onDeleteBrick called for index ${index}, current bricks:`, bricks.length);
      
      // Verify the brick exists
      const brickToDelete = brick;
      if (!brickToDelete) {
        console.error(`No brick found at index ${index}, can't delete`);
        return;
      }

      // Check if the brick is locked
      if (brickToDelete.isLocked) {
        console.log(`Brick with ID ${brickToDelete.id} is locked, cannot delete`);
        return;
      }
      
      console.log(`Deleting brick with ID ${brickToDelete.id}`);
      
      // Call the handler with isFromChannel=false so it will emit the event
      handleDeleteBrick(
        brickToDelete,
        index,
        bricks, 
        setBricks,
        false
      );
      
      // Start cooldown after deleting
      startCooldown();
    },
    [bricks, isInCooldown, startCooldown],
  )

  const onUpdateBrick = useCallback(
    (index: number, newPosition: [number, number, number]) => {
      handleUpdateBrick(index, newPosition, bricks, setBricks)
    },
    [bricks],
  )

  const onClearSet = useCallback(() => {
    console.log("Clear set triggered")
    handleClearSet(setBricks)
    // Close the modal
    setShowClearModal(false)
  }, [])

  const onPlayToggle = useCallback(() => {
    console.log("Play toggle triggered")
    handlePlayToggle(isPlaying, setIsPlaying)
  }, [isPlaying])

  const handleModeChange = useCallback((mode: "build" | "move" | "erase") => {
    setInteractionMode(mode)
  }, [])
  
  // Toggle camera mode
  const toggleCameraMode = useCallback(() => {
    setCameraMode(prev => prev === "orbit" ? "fpv" : "orbit")
  }, [])
  
  // Set up keyboard shortcuts
  useKeyboardShortcuts({
    isPlaying,
    width,
    depth,
    currentColors,
    setWidth,
    setDepth,
    setSelectedColor,
    setInteractionMode,
    onPlayToggle,
    currentTheme,
    handleThemeChange: handleThemeChange as (theme: string) => void,
    toggleCameraMode,
  })

  return (
    <div
      className="fixed inset-0 w-full h-full bg-gradient-to-b from-blue-900 to-black font-sans overflow-hidden"
      onContextMenu={(e) => e.preventDefault()} // Prevent context menu on right-click
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center h-full w-full">
          <div className="w-48 h-48 mb-6">
            <Canvas shadows camera={{ position: [3, 3, 3], fov: 40 }}>
              <ambientLight intensity={0.5} />
              <directionalLight 
                position={[20, 20, 20]} 
                intensity={6} 
                castShadow 
                shadow-mapSize-width={1024} 
                shadow-mapSize-height={1024}
              />
              <LoadingBrick />
              <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1, 0]} receiveShadow>
                <planeGeometry args={[10, 10]} />
                <shadowMaterial transparent opacity={0.2} />
              </mesh>
            </Canvas>
          </div>
          <span className="text-white text-xl font-medium">Loading...</span>
        </div>
      ) : (
        <>
          <Canvas shadows camera={{ position: [0, 15, 15], fov: 50 }}>
            <Scene
              bricks={bricks}
              selectedColor={selectedColor}
              width={width}
              depth={depth}
              onAddBrick={onAddBrick}
              onDeleteBrick={onDeleteBrick}
              onUpdateBrick={onUpdateBrick}
              isPlaying={isPlaying}
              interactionMode={interactionMode}
              isInCooldown={isInCooldown}
              selectedBlockType={selectedBlockType}
              selectedSpecialImage={selectedSpecialImage.id}
              isSpecialLocked={isSpecialLocked}
              cameraMode={cameraMode}
            />
            {cameraMode === "orbit" && (
              <OrbitControls
                ref={orbitControlsRef}
                target={[0, 0, 0]}
                minPolarAngle={0}
                maxPolarAngle={Math.PI / 2}
                minDistance={10} // Minimum zoom distance
                maxDistance={100} // Maximum zoom distance - increased from 40 to 100
                autoRotate={isPlaying}
                autoRotateSpeed={1}
                enableZoom={!isPlaying}
                enablePan={!isPlaying}
                enableRotate={!isPlaying}
              />
            )}
          </Canvas>

          {!isPlaying && (
            <>
              <ActionToolbar 
                onModeChange={handleModeChange} 
                currentMode={interactionMode} 
                cameraMode={cameraMode}
                onCameraModeToggle={toggleCameraMode}
              />
              <ColorSelector
                colors={currentColors}
                selectedColor={selectedColor}
                onSelectColor={handleSelectColor}
                width={width}
                depth={depth}
                onWidthChange={setWidth}
                onDepthChange={setDepth}
                onPlayToggle={onPlayToggle}
                isPlaying={isPlaying}
                currentTheme={currentTheme}
                onThemeChange={handleThemeChange}
                bricksCount={bricks.length}
                selectedBlockType={selectedBlockType}
                onSelectBlockType={setSelectedBlockType}
                selectedSpecialImage={selectedSpecialImage.id}
                onSelectSpecialImage={handleSelectSpecialImage}
                isSpecialLocked={isSpecialLocked}
                onToggleSpecialLock={setIsSpecialLocked}
                userPurchases={userPurchases}
              />
              {isInCooldown && <CooldownIndicator remainingTime={cooldownRemaining} />}
              
              {/* FPV Instructions */}
              {cameraMode === "fpv" && (
                <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-2 rounded-lg text-sm z-30">
                  Use WASD to move, QE for up/down, mouse to look around (V to toggle modes)
                </div>
              )}
            </>
          )}
          {isPlaying && (
            <button
              onClick={onPlayToggle}
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white hover:text-gray-300 transition-colors"
              aria-label="Stop"
            >
              <Pause className="w-8 h-8 stroke-[1.5]" />
            </button>
          )}

          {/* Modals */}
          <ClearConfirmationModal isOpen={showClearModal} onClose={() => setShowClearModal(false)} onClear={onClearSet} />
        </>
      )}
    </div>
  )
}

