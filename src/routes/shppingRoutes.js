import express from 'express';
import { handleShippingNotification } from '../controllers/shippingController.js';

const router = express.Router();

router.post('/shipping/notification', handleShippingNotification);

export default router;
