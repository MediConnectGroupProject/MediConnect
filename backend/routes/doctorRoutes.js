import express from 'express';
import {
    getDoctorStats,
    getAppointments,
    getUpNextAppointment,
    updateAppointmentStatus,
    createPrescription,
    getPatientById
} from '../controllers/doctorController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireRole } from '../middlewares/authMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/stats',protect, requireRole('doctor'), asyncHandler(getDoctorStats));
router.get('/appointments',protect, requireRole('doctor'), asyncHandler(getAppointments));
router.get('/appointments/up-next',protect, requireRole('doctor'), asyncHandler(getUpNextAppointment));
router.patch('/appointments/:appointmentId/status',protect, requireRole('doctor'), asyncHandler(updateAppointmentStatus));
router.post('/prescriptions',protect, requireRole('doctor'), asyncHandler(createPrescription));
router.get('/patients/:patientId',protect, requireRole('doctor'), asyncHandler(getPatientById));

export default router;
