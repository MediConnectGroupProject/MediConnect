import express from 'express';
import {
    getDoctorStats,
    getAppointments,
    getUpNextAppointment,
    updateAppointmentStatus,
    createPrescription,
    getPatientById,
    getPrescriptionRequests,
    updateDoctorAvailability,
    getDoctorAvailability,
    getPatients,
    createAppointment,
    getPrescriptionById,
    deletePrescription,
    getDoctorProfile,
    updateDoctorProfile
} from '../controllers/doctorController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireRole } from '../middleware/requireRole.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for Scanning QR Code
router.get('/prescriptions/:id/public', asyncHandler(getPrescriptionById));

router.get('/stats',protect, requireRole('doctor'), asyncHandler(getDoctorStats));
router.get('/appointments',protect, requireRole('doctor'), asyncHandler(getAppointments));
router.get('/appointments/up-next',protect, requireRole('doctor'), asyncHandler(getUpNextAppointment));
router.patch('/appointments/:appointmentId/status',protect, requireRole('doctor'), asyncHandler(updateAppointmentStatus));
router.get('/prescriptions/requests', protect, requireRole('doctor'), asyncHandler(getPrescriptionRequests));
router.post('/prescriptions',protect, requireRole('doctor'), asyncHandler(createPrescription));
router.delete('/prescriptions/:id', protect, requireRole('doctor'), asyncHandler(deletePrescription));
router.get('/patients/:patientId',protect, requireRole(['doctor', 'admin']), asyncHandler(getPatientById));

router.get('/availability', protect, requireRole('doctor'), asyncHandler(getDoctorAvailability));
router.put('/availability', protect, requireRole('doctor'), asyncHandler(updateDoctorAvailability));

router.get('/profile', protect, requireRole('doctor'), asyncHandler(getDoctorProfile));
router.patch('/profile', protect, requireRole('doctor'), asyncHandler(updateDoctorProfile));

router.get('/patients', protect, requireRole('doctor'), asyncHandler(getPatients));
router.post('/appointments', protect, requireRole('doctor'), asyncHandler(createAppointment));

export default router;
