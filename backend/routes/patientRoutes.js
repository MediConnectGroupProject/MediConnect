import express from 'express';
import {
    getMyAppointments,
    getMyPrescriptions,
    getNotifications,
    getBillingHistory,
    getAvailableDoctors,
    getAvailableSlots,
    bookAppointment,
    cancelAppointment
} from '../controllers/patientController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireRole } from '../middleware/requireRole.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/appointments', protect, requireRole('patient'), asyncHandler(getMyAppointments));
router.post('/appointments', protect, requireRole('patient'), asyncHandler(bookAppointment));
router.patch('/appointments/:id/cancel', protect, requireRole('patient'), asyncHandler(cancelAppointment));
router.get('/prescriptions', protect, requireRole('patient'), asyncHandler(getMyPrescriptions));
router.get('/notifications', protect, requireRole('patient'), asyncHandler(getNotifications));
router.get('/billing', protect, requireRole('patient'), asyncHandler(getBillingHistory));
router.get('/doctors', protect, requireRole('patient'), asyncHandler(getAvailableDoctors));
router.get('/doctors/:doctorId/slots', protect, requireRole('patient'), asyncHandler(getAvailableSlots));

export default router;

