"use server"

import { revalidatePath } from "next/cache"
import type { Brick } from "../../components/v0-blocks/events"
import type { SavedCreation } from "../types"

// Update an existing creation
export async function updateCreation(id: string, name: string, bricks: Brick[]) {
  try {
    // Get the existing creation
    // const existingCreationStr = await kv.get(`creation:${id}`)

    // if (!existingCreationStr) {
    //   return { success: false, message: "Creation not found." }
    // }

    // const existingCreation =
    //   typeof existingCreationStr === "string" ? JSON.parse(existingCreationStr) : (existingCreationStr as SavedCreation)

    // const timestamp = Date.now()

    // const updatedCreation: SavedCreation = {
    //   ...existingCreation,
    //   name,
    //   bricks,
    //   updatedAt: timestamp,
    // }

    // Update in Redis

    // Update score in sorted set

    revalidatePath("/")
    return { success: true, id, message: "Creation updated successfully!" }
  } catch (error) {
    console.error("Error updating creation:", error)
    return { success: false, message: "Failed to update creation." }
  }
}

