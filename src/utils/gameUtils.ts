import type { Context } from '@devvit/public-api';
/* @ts-ignore */
import type { Brick } from '../../game/src/components/blocks/events';

export type User = {
  username: string
  snoovatarUrl: string
}

export const createCreation = async (context: Context, postId: string, canvasSize: number, creationName: string) => {
  const { redis } = context;
  const creation = {
    bricks: [],
    canvasSize,
    creationName
  };
  
  const creationKey = `creation:${postId}`;
  await redis.set(creationKey, JSON.stringify(creation));
  return creation;
};

export const updateCreation = async (context: Context, bricks: Brick) => {
  console.log("Updating creation", bricks);
  const { postId, redis } = context;
  const creationKey = `creation:${postId}`;
  
  // Using Redis transaction for atomic operations
  const txn = await redis.watch(creationKey);
  await txn.multi();
  
  const creationJson = await redis.get(creationKey);
  if (!creationJson) {
    const newCreation = {
      bricks: [bricks]
    };
    await txn.set(creationKey, JSON.stringify(newCreation));
    console.log("Creation created", newCreation);
  } else {
    const creationData = JSON.parse(creationJson);
    creationData.bricks.push(bricks);
    await txn.set(creationKey, JSON.stringify(creationData));
  }
  
  await txn.exec();
};

export const getCreation = async (context: Context) => {
  const { postId, redis } = context;
  const creationKey = `creation:${postId}`;
  
  const creation = await redis.get(creationKey);
  
  if (!creation) {
    return {
      bricks: [],
      canvasSize: 0,
      creationName: ''
    };
  }
  
  return JSON.parse(creation);
};

export const deleteBrick = async (context: Context, brick: Brick) => {
  const { postId, redis } = context;
  const creationKey = `creation:${postId}`;
  
  // Using Redis transaction
  const txn = await redis.watch(creationKey);
  await txn.multi();
  
  const creationJson = await redis.get(creationKey);
  if (creationJson) {
    const creationData = JSON.parse(creationJson);
    creationData.bricks = creationData.bricks.filter((b: Brick) => b.id !== brick.id);
    await txn.set(creationKey, JSON.stringify(creationData));
  }
  
  await txn.exec();
};

export const addUser = async (context: Context, user: User) => {
  const { postId, redis } = context;
  const usersKey = `users:${postId}`;
  
  const txn = await redis.watch(usersKey);
  await txn.multi();
  
  const usersJson = await redis.get(usersKey);
  if (!usersJson) {
    await txn.set(usersKey, JSON.stringify([user]));
  } else {
    try {
      const usersData = JSON.parse(usersJson);
      console.log("usersData", usersData);
      
      // Ensure usersData is an array
      const userArray = Array.isArray(usersData) ? usersData : [];
      
      if (!userArray.some((u: User) => u.username === user.username)) {
        userArray.push(user);
        await txn.set(usersKey, JSON.stringify(userArray));
      }
    } catch (error) {
      console.error("Error parsing users data:", error);
      // Reset to a new array with just this user if parsing fails
      await txn.set(usersKey, JSON.stringify([user]));
    }
  }
  
  await txn.exec();
  const updatedUsers = await redis.get(usersKey);
  return updatedUsers ? JSON.parse(updatedUsers) : [];
};

export const getUsers = async (context: Context) => {
  const { postId, redis } = context;
  const usersKey = `users:${postId}`;
  
  try {
    const users = await redis.get(usersKey);
    
    if (!users) {
      return [];
    }
    
    const parsedUsers = JSON.parse(users);
    return Array.isArray(parsedUsers) ? parsedUsers : [];
  } catch (error) {
    console.error("Error getting users:", error);
    return [];
  }
};

export const deleteUser = async (context: Context, user: User) => {
  const { postId, redis } = context;
  const usersKey = `users:${postId}`;
  
  // Using Redis transaction
  const txn = await redis.watch(usersKey);
  await txn.multi();
  
  const usersJson = await redis.get(usersKey);
  if (usersJson) {
    try {
      let usersData = JSON.parse(usersJson);
      
      // Ensure usersData is an array
      const userArray = Array.isArray(usersData) ? usersData : [];
      
      const filteredUsers = userArray.filter((u: User) => u.username !== user.username);
      console.log("Deleting user", user);
      console.log("Users data", filteredUsers);
      await txn.set(usersKey, JSON.stringify(filteredUsers));
    } catch (error) {
      console.error("Error parsing users data during deletion:", error);
      // If parsing fails, set an empty array
      await txn.set(usersKey, JSON.stringify([]));
    }
  }
  
  await txn.exec();
  const updatedUsers = await redis.get(usersKey);
  return updatedUsers ? JSON.parse(updatedUsers) : [];
};