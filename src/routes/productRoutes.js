import express from 'express';
import { getProducts, createProduct } from '../controllers/productsController.js';
import { uploadImages } from '../middlewares/upload.js';

const router = express.Router();

router.get('/get-products', getProducts);
router.post('/create-product', uploadImages, createProduct);

export default router;
