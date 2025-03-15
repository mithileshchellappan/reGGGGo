// Real-time communication utilities

export function sendMessage(msg: any): void {
  parent.postMessage(msg, document.referrer)
}

export function onMessage(callback: (msg: any) => void): void {
  console.log("Listening for messages")
  window.addEventListener("message", (event) => {
    if (event.data.type === "devvit-message") {
      callback(event.data.data)
    }
  })
}

// Message types
export enum MessageType {
  BRICK_ADDED = "BRICK_ADDED",
  BRICK_DELETED = "BRICK_DELETED",
  TIMER_UPDATE = "TIMER_UPDATE",
  CANVAS_RESIZE = "CANVAS_RESIZE",
  USER_JOINED = "USER_JOINED",
  USER_LEFT = "USER_LEFT",
}

// User type
export interface User {
  id: string
  username: string
  avatarUrl: string
}

// Brick with user information
export interface BrickWithUser {
  brickIndex: number
  userId: string
}

