import Order from '../models/orderModel.js';

export const handlePaymentConfirmationService = async (orderId) => {
  const order = await Order.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }
  order.status = 'in-progress';
  await order.save();
};
