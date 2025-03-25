import { addPaymentHandler } from '@devvit/payments';

// Configure the payment handler for the app
export function setupPaymentHandler() {
  addPaymentHandler({
    fulfillOrder: async (order, ctx) => {
      // Check if the order contains your product
      if (!order.products.some(({ sku }) => sku === 'moss')) {
        throw new Error('Unable to fulfill order: sku not found');
      }
      
      if (order.status !== 'PAID') {
        throw new Error('Payment required');
      }
      
      // Handle the successful purchase
      // For example, store in Redis that the user has purchased this item
      const redisKey = `user:${ctx.userId}:purchases:${order.products[0].sku}`;
      await ctx.redis.set(redisKey, 'true');
    },
  });
} 