import express from 'express';
import {
    getDailyAppointments,
    checkInPatient,
    getPendingBills,
    processPayment
} from '../controllers/receptionistController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireRole } from '../middleware/requireRole.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/appointments/today', protect,requireRole('receptionist'), asyncHandler(getDailyAppointments));
router.patch('/appointments/:appointmentId/check-in', protect,requireRole('receptionist'), asyncHandler(checkInPatient));
router.get('/bills/pending', protect,requireRole('receptionist'), asyncHandler(getPendingBills));
router.patch('/bills/:billId/pay', protect, asyncHandler(processPayment));

export default router;
