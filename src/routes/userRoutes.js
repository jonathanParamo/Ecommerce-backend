import express from 'express';
import { getUsers, createUser } from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', authMiddleware, getUsers);
router.post('/create-user', createUser);

export default router;
