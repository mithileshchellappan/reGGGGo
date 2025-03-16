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
  BRICK_ADDED = "brickAdded",
  BRICK_DELETED = "brickDeleted",
  TIMER_UPDATE = "timerUpdate",
  CANVAS_RESIZE = "canvasResize",
  USER_JOINED = "userJoined",
  USER_LEFT = "userLeft",
  INITIAL_DATA="initialData"
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

