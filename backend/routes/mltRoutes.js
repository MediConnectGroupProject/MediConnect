import express from 'express';
import {
    getLabReportQueue,
    updateLabReport
} from '../controllers/mltController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireRole } from '../middleware/requireRole.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/reports',protect, requireRole('mlt'), asyncHandler(getLabReportQueue));
router.patch('/reports/:reportId',protect, requireRole('mlt'), asyncHandler(updateLabReport));

export default router;
