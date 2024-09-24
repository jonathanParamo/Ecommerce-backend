import express from 'express';
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';
import { adminMiddleware, authenticate } from '../middlewares/adminMiddleware.js';

const router = express.Router();

router.get('/', getCategories);
router.post('/',authenticate, adminMiddleware, createCategory);
router.get('/categories/:id', getCategoryById);
router.patch('/:id', authenticate, adminMiddleware, updateCategory);
router.delete('/:id',authenticate, adminMiddleware, deleteCategory);

export default router;
