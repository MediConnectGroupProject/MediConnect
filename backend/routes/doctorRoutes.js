import express from 'express';
import {
    getDoctorStats,
    getAppointments,
    getUpNextAppointment,
    updateAppointmentStatus,
    createPrescription,
    getPatientById
} from '../controllers/doctorController.js';
import passport from 'passport';

const router = express.Router();

// Middleware to protect routes (require authentication)
const protect = passport.authenticate('jwt', { session: false });

router.get('/stats', protect, getDoctorStats);
router.get('/appointments', protect, getAppointments);
router.get('/appointments/up-next', protect, getUpNextAppointment);
router.patch('/appointments/:appointmentId/status', protect, updateAppointmentStatus);
router.post('/prescriptions', protect, createPrescription);
router.get('/patients/:patientId', protect, getPatientById);

export default router;
