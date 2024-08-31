import express from 'express';
import { handlePaymentConfirmation } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/payment/confirmation', handlePaymentConfirmation);

export default router;
