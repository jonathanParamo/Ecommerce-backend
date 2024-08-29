import express from 'express';
import { getProducts } from '../controllers/productsController.js';

const router = express.Router();

router.get('/', getProducts);
// router.post('/create-user', createUser);

export default router;
