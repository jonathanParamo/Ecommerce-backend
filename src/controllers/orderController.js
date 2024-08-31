import Stripe from 'stripe';
import dotenv from 'dotenv';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';

dotenv.config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

export const createOrder = async (req, res) => {
  try {
    const { userId, products, paymentMethodId } = req.body;

    // Array to store products with updated details
    let updatedProducts = [];

    // Iterate over each product in the cart
    for (let item of products) {
      const product = await Product.findById(item.productId);

      if (!product) {
        return res.status(404).json({ message: `Product with ID ${item.productId} not found` });
      }

      if (product.quantity < item.quantity) {
        return res.status(400).json({
          message: `Insufficient quantity for product ${product.name}. Available: ${product.quantity}`,
        });
      }

      // Apply discount using the model method
      const finalPrice = product.applyDiscount();

      // Check if the price is a valid number
      if (isNaN(finalPrice) || isNaN(item.quantity)) {
        return res.status(400).json({ message: 'Invalid price or quantity' });
      }

      // Add the product with updated details
      updatedProducts.push({
        productId: product._id,
        quantity: item.quantity,
        price: finalPrice,
      });
    }

    // Calculate the totalAmount with the updated prices
    const totalAmount = updatedProducts.reduce((acc, product) => {
      return acc + (product.quantity * product.price);
    }, 0);

    // Create an order with the updated products
    const order = new Order({
      userId,
      products: updatedProducts,
      totalAmount,
      status: 'pending',
    });

    await order.save();

    // Update the product quantity in the database
    for (let item of updatedProducts) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { quantity: -item.quantity },
      });
    }

    // Create Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      payment_method: paymentMethodId,
      automatic_payment_methods: {
        enabled: true,
        allow_redirects: 'never',
      },
      confirm: true,
    });

    // Update the order status if the payment was successful
    if (paymentIntent.status === 'succeeded') {
      order.status = 'paid';
      await order.save();
    }

    res.status(201).json({ order, paymentIntent });
  } catch (error) {
    res.status(500).json({ message: 'Error creating order', error });
  }
};

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
    const orders = await Order.find().populate('userId').populate('products.productId');
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error });
  }
};

// export const updateOrderStatus = async (req, res) => {
//   try {
//     const { orderId } = req.params;
//     const { status } = req.body;

//     const order = await Order.findByIdAndUpdate(orderId, { status }, { new: true });

//     if (!order) {
//       return res.status(404).json({ message: 'Order not found' });
//     }

//     res.status(200).json(order);
//   } catch (error) {
//     res.status(500).json({ message: 'Error updating order status', error });
//   }
// };

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
    const { id } = req.params;
    const { status } = req.body;

    // Validar el nuevo estado
    const validStatuses = ['pending', 'in-progress', 'shipped', 'delivered', 'canceled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const order = await Order.findById(id);
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

