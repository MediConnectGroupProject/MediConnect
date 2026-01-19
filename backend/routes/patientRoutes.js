import express from 'express';
import {
    getMyAppointments,
    getMyPrescriptions,
    getNotifications,
    getBillingHistory
} from '../controllers/patientController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireRole } from '../middlewares/authMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/appointments', protect,requireRole('patient'), asyncHandler(getMyAppointments));
router.get('/prescriptions', protect,requireRole('patient'), asyncHandler(getMyPrescriptions));
router.get('/notifications', protect,requireRole('patient'), asyncHandler(getNotifications));
router.get('/billing', protect,requireRole('patient'), asyncHandler(getBillingHistory));

export default router;
