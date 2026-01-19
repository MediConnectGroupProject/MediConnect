import express from 'express';
import {
    getLabReportQueue,
    updateLabReport
} from '../controllers/mltController.js';
import passport from 'passport';

const router = express.Router();

// Middleware
const protect = passport.authenticate('jwt', { session: false });

router.get('/reports', protect, getLabReportQueue);
router.patch('/reports/:reportId', protect, updateLabReport);

export default router;
