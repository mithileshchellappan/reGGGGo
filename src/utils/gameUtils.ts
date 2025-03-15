import type { Context } from '@devvit/public-api';
/* @ts-ignore */
import type { Brick } from '../../game/src/components/v0-blocks/events';


export const updateCreation = async (context: Context, bricks: Brick) => {
const {postId, kvStore: kv} =  context
  const creation = await kv.get(`creation:${postId}`)
  if (!creation) {
    const creation = {
        bricks: [bricks]
    }
    await kv.put(`creation:${postId}`, JSON.stringify(creation))
    console.log("Creation created", creation)
  }
  const creationData = JSON.parse(creation as unknown as string)
  creationData.bricks.push(bricks)
  await kv.put(`creation:${postId}`, JSON.stringify(creationData))
}

export const getCreation = async (context: Context) => {
  const {postId, kvStore: kv} =  context
  const creation = await kv.get(`creation:${postId}`)
  return JSON.parse(creation as unknown as string) || []
}

export const deleteBrick = async (context: Context, brick: Brick) => {
  const {postId, kvStore: kv} =  context
  const creation = await kv.get(`creation:${postId}`)
  const creationData = JSON.parse(creation as unknown as string)
  creationData.bricks = creationData.bricks.filter((b: Brick) => b.id !== brick.id)
  await kv.put(`creation:${postId}`, JSON.stringify(creationData))
}
