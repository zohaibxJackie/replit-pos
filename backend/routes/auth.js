import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validate, loginSchema, registerSchema, updatePasswordSchema } from '../validators/auth.js';

const router = Router();

router.post('/login', validate(loginSchema), authController.login);
router.post('/register', validate(registerSchema), authController.register);
router.post('/logout', authenticateToken, authController.logout);
router.post('/refresh-token', authController.refreshToken);
router.get('/me', authenticateToken, authController.getMe);
router.put('/password', authenticateToken, validate(updatePasswordSchema), authController.updatePassword);
router.post('/forgot-password', authController.forgotPassword);

export default router;
