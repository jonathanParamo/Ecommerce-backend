import Order from '../models/orderModel.js';

export const handleShippingNotificationService = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }
  order.status = 'shipped';
  await order.save();
};
