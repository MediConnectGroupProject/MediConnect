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
import { validateRequest } from '../middleware/validateRequestMiddleware.js';
import { checkInSchema, confirmSchema, cancelSchema, completeSchema, paymentSchema } from '../validators/receptionistValidator.js';

const router = express.Router();


router.get('/appointments/today', protect, requireRole('receptionist'), asyncHandler(getDailyAppointments));
router.patch('/appointments/:appointmentId/check-in', protect, requireRole('receptionist'), validateRequest(checkInSchema), asyncHandler(checkInPatient));
router.patch('/appointments/:appointmentId/confirm', protect, requireRole('receptionist'), validateRequest(confirmSchema), asyncHandler(confirmAppointment));
router.patch('/appointments/:appointmentId/cancel', protect, requireRole('receptionist'), validateRequest(cancelSchema), asyncHandler(cancelAppointment));
router.patch('/appointments/:appointmentId/complete', protect, requireRole('receptionist'), validateRequest(completeSchema), asyncHandler(completeAppointment));
router.get('/bills/pending', protect, requireRole('receptionist'), asyncHandler(getPendingBills));
router.get('/bills/invoices', protect, requireRole('receptionist'), asyncHandler(getInvoices));
router.patch('/bills/:billId/pay', protect, validateRequest(paymentSchema), asyncHandler(processPayment));

export default router;
