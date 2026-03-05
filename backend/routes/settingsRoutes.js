import express from 'express';
import { getSettings, updateSettings, getPublicSettings } from '../controllers/settingsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { requireRole } from '../middleware/requireRole.js';

const router = express.Router();

// Public route for Landing Page / Login
router.get('/public', getPublicSettings);

// Protected Admin Routes
router.get('/', protect, requireRole(['ADMIN']), getSettings);
router.put('/', protect, requireRole(['ADMIN']), updateSettings);

export default router;
