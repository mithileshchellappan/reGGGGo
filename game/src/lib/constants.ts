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

export const SPECIAL_IMAGES = [
  {
    id: "moss",
    imageUrl: "/assets/image-textures/moss.jpg",
  },
  // {
  //   id: "brick",
  //   imageUrl: "/assets/image-textures/brick.jpg",
  // },
  // {
  //   id: "wood",
  //   imageUrl: "/assets/image-textures/wood.jpg",
  // },
  // {
  //   id: "metal",
  //   imageUrl: "/assets/image-textures/metal.jpg",
  // },
  // {
  //   id: "stone",
  //   imageUrl: "/assets/image-textures/stone.jpg",
  // },
  // {
  //   id: "grass",
  //   imageUrl: "/assets/image-textures/grass.jpg",
  // },
  // {
  //   id: "tile",
  //   imageUrl: "/assets/image-textures/tile.jpg",
  // },
  // {
  //   id: "water",
  //   imageUrl: "/assets/image-textures/water.jpg",
  // }
]
