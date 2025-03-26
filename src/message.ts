/* @ts-ignore */
import type { Brick } from "./game/src/components/v0-blocks/events"

/** Message from Devvit to the web view. */


/** Message from the web view to Devvit. */
export type WebViewMessage =
  | { type: 'webViewReady' }
  | { type: 'brickAdded'; data: { brick: Brick } }
  | { type: 'brickDeleted'; data: { brick: Brick; index: number } }

export type DevvitMessage =
  | { type: 'initialData'; data: { username: string; creation: { bricks: Brick[]; creationId: string},  userPurchases: { [key: string]: boolean }  } } 
  | { type: 'channelBrickAdded'; data: { brick: Brick; fromChannel: boolean } }
  | { type: 'channelBrickDeleted'; data: { index: number; brick: Brick; brickId: string; fromChannel: boolean } }

/**
 * Web view MessageEvent listener data type. The Devvit API wraps all messages
 * from Blocks to the web view.
 */
export type DevvitSystemMessage = {
  data: { message: DevvitMessage };
  /** Reserved type for messages sent via `context.ui.webView.postMessage`. */
  type?: 'devvit-message' | string;
};
