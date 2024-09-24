import { handlePaymentConfirmationService } from '../services/paymentService.js';

export const handlePaymentConfirmation = async (req, res) => {
  try {
    const { session_id, order_id } = req.body;
    await handlePaymentConfirmationService(session_id, order_id);
    res.status(200).json({ message: 'Payment confirmed and order updated' });
  } catch (error) {
    res.status(500).json({ message: 'Error handling payment confirmation', error: error.message });
  }
};
