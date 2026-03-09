import express from 'express';
import {
    getLabReportQueue,
    getCompletedLabReports,
    updateLabReport
} from '../controllers/mltController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireRole } from '../middleware/requireRole.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequestMiddleware.js';
import { updateLabReportSchema } from '../validators/mltValidator.js';

const router = express.Router();


router.get('/reports', protect, requireRole('mlt'), asyncHandler(getLabReportQueue));
router.get('/reports/completed', protect, requireRole('mlt'), asyncHandler(getCompletedLabReports));
router.put('/reports/:reportId', protect, validateRequest(updateLabReportSchema), requireRole('mlt'), asyncHandler(updateLabReport));

export default router;
