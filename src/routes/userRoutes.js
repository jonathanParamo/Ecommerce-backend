import express from 'express';
import { getUsers, createUser, loginUser, createAdmin, loginAdmin } from '../controllers/userController.js';
import { requestPasswordReset } from '../controllers/requestPasswordReset.js';
import { resetPasswordController } from '../controllers/resertPassword.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { adminMiddleware } from '../middlewares/adminMiddleware.js';

const router = express.Router();

// user routes
router.get('/', authMiddleware, adminMiddleware, getUsers);
router.post('/create-user', createUser);
router.post('/login', loginUser);
router.post('/login-admin', loginAdmin);
router.post('/create-admin', adminMiddleware, createAdmin);

// password recovery routes
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPasswordController);

export default router;
