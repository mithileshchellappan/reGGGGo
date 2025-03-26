import { addPaymentHandler } from '@devvit/payments';
import { Context, TriggerContext } from '@devvit/public-api';
import products from '../products.json' assert { type: 'json' };

export function setupPaymentHandler() {
  addPaymentHandler({
    fulfillOrder: async (order, ctx) => {
      const skus = products.products.map((product) => product.sku);
      if (!order.products.some(({ sku }) => skus.includes(sku))) {
        throw new Error('Unable to fulfill order: sku not found');
      }
      if (!ctx.userId) throw new Error('User ID not found');
      if (order.status !== 'PAID') {
        throw new Error('Payment required');
      }
      const userPurchases = await addUserPurchase(ctx,order.products[0].sku);
      console.log('userPurchases', userPurchases);
    },
    refundOrder: async (order, ctx) => {
        const userId = ctx.userId;
        if(!userId) throw new Error('User ID not found');
        console.log('refunding order', order);
        await refundUserPurchase(ctx, order.products[0].sku);
    },
  });
}

export async function getUserPurchases(ctx: TriggerContext | Context) {
    const userId = ctx.userId;
    if(!userId) throw new Error('User ID not found');
    const redisKey = `user:${userId}:purchases`;
    const purchases = await ctx.redis.get(redisKey);
    if(!purchases) return null;
    return JSON.parse(purchases);
}

export async function addUserPurchase(ctx: TriggerContext | Context, sku: string) {
    const userId = ctx.userId;
    if(!userId) throw new Error('User ID not found');
    const redisKey = `user:${userId}:purchases`;
    const userPurchases = await getUserPurchases(ctx);
    if(!userPurchases) {
        const setObj ={
            userId: userId,
            purchases: {
                [sku]: true
            }
        }
        await ctx.redis.set(redisKey, JSON.stringify(setObj))
        return setObj;
    } else {
        const purchases = userPurchases;
        purchases.purchases[sku] = true;
        await ctx.redis.set(redisKey, JSON.stringify(purchases));
        return purchases;
    }
}

export async function refundUserPurchase(ctx: TriggerContext | Context, sku: string) {
    const userId = ctx.userId;
    if(!userId) throw new Error('User ID not found');
    const redisKey = `user:${userId}:purchases`;
    const userPurchases = await getUserPurchases(ctx);
    if(!userPurchases) return;
    delete userPurchases.purchases[sku];
    await ctx.redis.set(redisKey, JSON.stringify(userPurchases));
}
