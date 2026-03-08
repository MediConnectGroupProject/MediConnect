import express from 'express';
import {
    getDailyAppointments,
    checkInPatient,
    confirmAppointment,
    cancelAppointment,
    getPendingBills,
    getInvoices,
    processPayment,
    completeAppointment
} from '../controllers/receptionistController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireRole } from '../middleware/requireRole.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/appointments/today', protect, requireRole('receptionist'), asyncHandler(getDailyAppointments));
router.patch('/appointments/:appointmentId/check-in', protect, requireRole('receptionist'), asyncHandler(checkInPatient));
router.patch('/appointments/:appointmentId/confirm', protect, requireRole('receptionist'), asyncHandler(confirmAppointment));
router.patch('/appointments/:appointmentId/cancel', protect, requireRole('receptionist'), asyncHandler(cancelAppointment));
router.patch('/appointments/:appointmentId/complete', protect, requireRole('receptionist'), asyncHandler(completeAppointment));
router.get('/bills/pending', protect, requireRole('receptionist'), asyncHandler(getPendingBills));
router.get('/bills/invoices', protect, requireRole('receptionist'), asyncHandler(getInvoices));
router.patch('/bills/:billId/pay', protect, asyncHandler(processPayment));

export default router;
