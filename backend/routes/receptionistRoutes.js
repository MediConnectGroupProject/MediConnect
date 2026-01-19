import express from 'express';
import {
    getDailyAppointments,
    checkInPatient,
    getPendingBills,
    processPayment
} from '../controllers/receptionistController.js';
import passport from 'passport';

const router = express.Router();

// Middleware
const protect = passport.authenticate('jwt', { session: false });

router.get('/appointments/today', protect, getDailyAppointments);
router.patch('/appointments/:appointmentId/check-in', protect, checkInPatient);
router.get('/bills/pending', protect, getPendingBills);
router.patch('/bills/:billId/pay', protect, processPayment);

export default router;
