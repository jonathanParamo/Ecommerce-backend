import express from 'express';
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  createCheckoutSession,
  createOrderAfterPayment,
  getMonthlySales,
} from '../controllers/orderController.js';
import { adminMiddleware, authenticate } from '../middlewares/adminMiddleware.js';


const router = express.Router();

router.get('/sales', getMonthlySales);
router.post('/create-checkout-session', createCheckoutSession);
router.post('/create-order', createOrderAfterPayment);
router.get('/', authenticate, adminMiddleware, getOrders);
router.get('/:orderId', authenticate, adminMiddleware, getOrderById);
router.patch('/:orderId/status', authenticate, adminMiddleware, updateOrderStatus);
router.delete('/:orderId', authenticate, adminMiddleware, deleteOrder);



export default router;
