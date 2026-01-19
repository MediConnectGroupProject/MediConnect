import express from 'express';
import {
    getMyAppointments,
    getMyPrescriptions,
    getNotifications,
    getBillingHistory
} from '../controllers/patientController.js';
import passport from 'passport';

const router = express.Router();

// Middleware
const protect = passport.authenticate('jwt', { session: false });

router.get('/appointments', protect, getMyAppointments);
router.get('/prescriptions', protect, getMyPrescriptions);
router.get('/notifications', protect, getNotifications);
router.get('/billing', protect, getBillingHistory);

export default router;
