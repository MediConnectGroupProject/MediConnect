import express from 'express';
const app = express();
const router = express.Router();

import { login, register, logout, verifyEmail ,getMe } from '../controllers/authController.js';
import {
    asyncHandler
} from '../utils/asyncHandler.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequestMiddleware.js';
import { registerSchema ,loginSchema } from '../validators/authValidator.js';

// user authentication routes
router.post('/login', validateRequest(loginSchema), asyncHandler(login));
router.post('/register', validateRequest(registerSchema), asyncHandler(register));
router.post('/logout', protect, asyncHandler(logout));
router.get('/verify-email', asyncHandler(verifyEmail));
router.get('/me', protect, asyncHandler(getMe));

export default router;