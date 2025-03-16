// Real-time communication utilities

// Track recent messages to prevent duplicates
const recentMessages = new Set<string>();

export function sendMessage(msg: any): void {
  // Create a unique hash for this message to detect duplicates
  const messageHash = msg.type + (msg.data?.brick?.id || '');
  
  // Check if we've sent this exact message recently
  if (!recentMessages.has(messageHash)) {
    // Add to recent messages
    recentMessages.add(messageHash);
    
    // Remove from set after a short delay (50ms)
    setTimeout(() => {
      recentMessages.delete(messageHash);
    }, 50);
    
    // Send the message
    parent.postMessage(msg, document.referrer);
  } else {
    console.log(`Prevented duplicate message: ${messageHash}`);
  }
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
  INITIAL_DATA="initialData",
  CHANNEL_BRICK_ADDED = "channelBrickAdded",
  CHANNEL_BRICK_DELETED = "channelBrickDeleted",
}

