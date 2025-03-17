import type { Context } from '@devvit/public-api';
/* @ts-ignore */
import type { Brick } from '../../game/src/components/v0-blocks/events';

export type User = {
  username: string
  snoovatarUrl: string
}

export const createCreation = async (context: Context, postId:string, canvasSize: number, creationName: string ) => {
  const { kvStore: kv} = context
  const creation = {
    bricks: [],
    canvasSize,
    creationName
  }
  await kv.put(`creation:${postId}`, JSON.stringify(creation))
  return creation
}

export const updateCreation = async (context: Context, bricks: Brick) => {
  console.log("Updating creation", bricks)
const {postId, kvStore: kv} =  context
  const creation = await kv.get(`creation:${postId}`)
  console.log("Getting creation in updateCreation", creation)
  if (!creation) {
    const creation = {
        bricks: [bricks]
    }
    await kv.put(`creation:${postId}`, JSON.stringify(creation))
    console.log("Creation created", creation)
    return
  }
  const creationData = JSON.parse(creation as unknown as string)
  creationData.bricks.push(bricks)
  await kv.put(`creation:${postId}`, JSON.stringify(creationData))
}

export const getCreation = async (context: Context) => {
  const {postId, kvStore: kv} =  context
  const creation = await kv.get(`creation:${postId}`)
  console.log(creation)
  return JSON.parse(creation as unknown as string) || []
}

export const deleteBrick = async (context: Context, brick: Brick) => {
  const {postId, kvStore: kv} =  context
  const creation = await kv.get(`creation:${postId}`)
  const creationData = JSON.parse(creation as unknown as string)
  creationData.bricks = creationData.bricks.filter((b: Brick) => b.id !== brick.id)
  await kv.put(`creation:${postId}`, JSON.stringify(creationData))
}

export const addUser = async (context: Context, user: User) => {
  const {postId, kvStore: kv} =  context
  const users = await kv.get(`users:${postId}`)
  if(!users) {
    await kv.put(`users:${postId}`, JSON.stringify([user]))
    return
  }
  const usersData = JSON.parse(users as unknown as string)
  if(usersData.find((u: User) => u.username === user.username)) {
    return
  }
  usersData.push(user)
  await kv.put(`users:${postId}`, JSON.stringify(usersData))
  return usersData
}

export const getUsers = async (context: Context) => {
  const {postId, kvStore: kv} =  context
  const users = await kv.get(`users:${postId}`)
  if(!users) {
    return []
  }
  return JSON.parse(users as unknown as string) || []
}

export const deleteUser = async (context: Context, user: User) => {
  const {postId, kvStore: kv} =  context
  const users = await kv.get(`users:${postId}`)
  let usersData = JSON.parse(users as unknown as string)
  usersData = usersData.filter((u: User) => u.username !== user.username)
  console.log("Deleting user", user)
  console.log("Users data", usersData)
  await kv.put(`users:${postId}`, JSON.stringify(usersData))
  return usersData
}