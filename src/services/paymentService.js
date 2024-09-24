import Order from '../models/orderModel.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const handlePaymentConfirmationService = async (sessionId, orderId) => {
  // Verifica la sesión de pago en Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status === 'paid') {
    // Aquí puedes actualizar el estado de la orden en tu base de datos
    // Por ejemplo, si tienes un modelo de Order:
    const order = await Order.findById(orderId);

    if (!order) {
      throw new Error('Order not found');
    }

    // Actualiza el estado de la orden
    order.status = 'confirmed'; // Cambia el estado según tu lógica
    await order.save();
  } else {
    throw new Error('Payment not successful');
  }
};
