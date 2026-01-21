import express from 'express';
import { getMe, updateMe } from '../controllers/userController.js';
import passport from 'passport';

const router = express.Router();

// Middleware
const protect = passport.authenticate('jwt', { session: false });

router.get('/me', protect, getMe);
router.patch('/me', protect, updateMe);

export default router;
