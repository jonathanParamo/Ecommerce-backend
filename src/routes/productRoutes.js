import express from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../controllers/productsController.js';
import { uploadImages } from '../middlewares/upload.js';

const router = express.Router();

router.get('/get-products', getProducts);
router.post('/create-product', uploadImages, createProduct);
router.put('/update-product/:productId', uploadImages, updateProduct);
router.delete('/delete-product/:productId', deleteProduct);

export default router;
