import { handleShippingNotificationService } from '../services/shippingService.js';

export const handleShippingNotification = async (req, res) => {
  try {
    const { orderId } = req.body;
    await handleShippingNotificationService(orderId);
    res.status(200).json({ message: 'Shipping notification processed and order updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error handling shipping notification', error });
  }
};
