// Make grid size configurable
export let GRID_SIZE = 20
export const MAX_GRID_SIZE = 60

export const BRICK_HEIGHT = 1.2
export const LAYER_GAP = 0.005
export const GROUND_HEIGHT = BRICK_HEIGHT / 4
export const STUD_HEIGHT = 0.2
export const STUD_RADIUS = 0.3
export const STUD_SEGMENTS = 16

// Default timer duration in seconds
export const DEFAULT_TIMER_DURATION = 300 // 5 minutes

// Update grid size
export function updateGridSize(size: number) {
  const newSize = Math.min(Math.max(10, size), MAX_GRID_SIZE)
  console.log(`Updating grid size from ${GRID_SIZE} to ${newSize}`)

  // Update the global variable
  GRID_SIZE = newSize

  // Dispatch a custom event that components can listen for
  if (typeof window !== "undefined") {
    const event = new CustomEvent("gridSizeChanged", { detail: { size: newSize } })
    console.log("Dispatching gridSizeChanged event", event)
    window.dispatchEvent(event)
  }

  return GRID_SIZE
}

export const TEXTURES = {
  roughness: "assets/textures/roughness.jpg",
  normal: "assets/textures/normal.jpg",
  color: "assets/textures/color.jpg",
}

export const MARBLE_TEXTURES = {
  roughness: "assets/textures/marbel_roughness.jpg",
  normal: "assets/textures/marble_normal.jpg",
  color: "assets/textures/marble_color.jpg",
}

export type SpecialImage = {
  id: string;
  color: string;
  roughness: string;
  normal: string;
  roughnessValue?: number;  // Custom roughness value
  metalnessValue?: number;  // Custom metalness value
}

// Special images now only need IDs
export const SPECIAL_IMAGES: SpecialImage[]  = [
  {
    id: "moss",
    color: "assets/textures/image-textures/moss/color.jpg",
    roughness: "assets/textures/image-textures/moss/roughness.jpg",
    normal: "assets/textures/image-textures/moss/normal.png",
    roughnessValue: 0.8,
    metalnessValue: 0.1
  },
  {
    id: "sci-fi",
    color: "assets/textures/image-textures/sci-fi/color.png",
    roughness: "assets/textures/image-textures/sci-fi/roughness.png",
    normal: "assets/textures/image-textures/sci-fi/normal.png",
    roughnessValue: 0.5,
    metalnessValue: 0.6
  },
  {
    id: "tile",
    color: "assets/textures/image-textures/tile/color.png",
    roughness: "assets/textures/image-textures/tile/roughness.png",
    normal: "assets/textures/image-textures/tile/normal.png",
    roughnessValue: 0.4,
    metalnessValue: 0.2
  },
  {
    id: 'wood',
    color: "assets/textures/image-textures/wood/color.jpg",
    roughness: "assets/textures/image-textures/wood/roughness.jpg",
    normal: "assets/textures/image-textures/wood/normal.jpg",
    roughnessValue: 0.9,
    metalnessValue: 0.1
  },
  {
    id: 'metal',
    color: "assets/textures/image-textures/metal/color.jpg",
    roughness: "assets/textures/image-textures/metal/roughness.jpg",
    normal: "assets/textures/image-textures/metal/normal.jpg",
    roughnessValue: 0.3,
    metalnessValue: 0.8
  },
  {
    id: 'gold',
    color: "assets/textures/image-textures/gold/color.jpg",
    roughness: "assets/textures/image-textures/gold/roughness.jpg",
    normal: "assets/textures/image-textures/gold/normal.jpg",
    roughnessValue: 0.2,
    metalnessValue: 0.9
  },
  {
    id: 'leather',
    color: "assets/textures/image-textures/leather/color.png",
    roughness: "assets/textures/image-textures/leather/roughness.png",
    normal: "assets/textures/image-textures/leather/normal.png",
    roughnessValue: 0.7,
    metalnessValue: 0.1
  }
]
