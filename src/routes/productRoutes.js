import express from 'express';
import { getProducts, createProduct, updateProduct, deleteProduct, getProductsLowStock, searchProducts } from '../controllers/productsController.js';
import { uploadImages } from '../middlewares/upload.js';
import { adminMiddleware, authenticate } from '../middlewares/adminMiddleware.js'

const router = express.Router();

router.get('/', getProducts);
router.post('/',authenticate,adminMiddleware, uploadImages, createProduct);
router.patch('/:productId',authenticate, adminMiddleware, uploadImages, updateProduct);
router.delete('/:productId',authenticate, adminMiddleware, deleteProduct);
router.get('/low-stock', getProductsLowStock);
router.get('/search', searchProducts);

export default router;
