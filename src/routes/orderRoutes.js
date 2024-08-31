import express from 'express';
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/orderController.js';

const router = express.Router();

router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:orderId', getOrderById);
router.put('/:orderId/status', updateOrderStatus);
router.patch('/orders/:id/status', updateOrderStatus);
router.delete('/:orderId', deleteOrder);

export default router;
