import Stripe from 'stripe';
import dotenv from 'dotenv';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

dotenv.config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId).populate('userId').populate('products.productId');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching order', error });
  }
};


export const getOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let filter = {};
    if (status) {
      filter.status = status;
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const skip = (pageNumber - 1) * limitNumber;

    const orders = await Order.find(filter)
      .populate('userId')
      .populate('products.productId')
      .skip(skip)
      .limit(limitNumber);

    // Calcular el número total de órdenes (sin paginación) para saber cuántas páginas hay
    const totalOrders = await Order.countDocuments(filter);

    // Devolver las órdenes junto con información sobre la paginación
    res.status(200).json({
      totalOrders,
      totalPages: Math.ceil(totalOrders / limitNumber),
      currentPage: pageNumber,
      orders,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

export const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    await Order.findByIdAndDelete(orderId);
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting order', error });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    // Validar el nuevo estado
    const validStatuses = ['pending', 'in-progress', 'shipped', 'delivered', 'canceled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Actualizar el estado de la orden
    order.status = status;
    await order.save();

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order status', error });
  }
};



export const createCheckoutSession = async (req, res) => {
  try {
    const { userId, products, cedula } = req.body;

    let updatedProducts = [];
    for (let item of products) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }
      if (product.quantity < item.quantity) {
        return res.status(400).json({ message: `Insufficient quantity for product ${product.name}. Available: ${product.quantity}` });
      }

      const finalPrice = product.applyDiscount();
      updatedProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: finalPrice,
        name: product.name,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: updatedProducts.map(product => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
          },
          unit_amount: product.price * 100,
        },
        quantity: product.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.PUBLIC_SITE_URL}/?session_id={CHECKOUT_SESSION_ID}&user_id=${userId}&cedula=${cedula}&products=${JSON.stringify(updatedProducts)}`,
      cancel_url: `${process.env.PUBLIC_SITE_URL_CANCEL}`,
    });

    res.status(201).json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: 'Error creating checkout session', error });
  }
};

export const createOrderAfterPayment = async (req, res) => {
  const { sessionId, userId, products, cedula } = req.body;

  try {
    // Verifica el estado de la sesión de pago en Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const existingOrder = await Order.findOneAndUpdate(
        { sessionId },
        {},
        { upsert: false }
      );

      if (existingOrder) {
        return res.status(400).json({ message: 'Order already exists for this session' });
      }

      // Si no existe la orden, se crea
      const order = new Order({
        userId,
        products,
        cedula,
        totalAmount: session.amount_total / 100,
        status: 'pending',
        sessionId,
      });

      await order.save();

      // Actualizar inventario
      for (let item of products) {
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { quantity: -item.quantity },
        });
      }

      return res.status(201).json({ message: 'Order created successfully' });
    } else {
      return res.status(400).json({ message: 'Payment not completed' });
    }
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Order already exists for this session' });
    } else {
      console.error('Error verifying payment session:', error);
      return res.status(500).json({ message: 'Error verifying payment session', error });
    }
  }
};


export const getMonthlySales = async (req, res) => {
  try {
    const sales = await Order.aggregate([
      {
          $group: {
              _id: { $month: '$createdAt' },
              totalSales: { $sum: '$totalAmount' },
          },
      },
      {
          $sort: { _id: 1 },
      },
    ]);

    res.json(sales);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
