import express from 'express';
import {
    getPrescriptionQueue,
    updatePrescriptionStatus,
    getInventory
} from '../controllers/pharmacistController.js';
import passport from 'passport';

const router = express.Router();

// Middleware
const protect = passport.authenticate('jwt', { session: false });

router.get('/prescriptions', protect, getPrescriptionQueue);
router.patch('/prescriptions/:prescriptionId/status', protect, updatePrescriptionStatus);
router.get('/inventory', protect, getInventory);

export default router;
