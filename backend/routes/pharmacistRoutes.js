import express from 'express';
import {
    getPrescriptionQueue,
    updatePrescriptionStatus,
    getInventory
} from '../controllers/pharmacistController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireRole } from '../middlewares/authMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();


router.get('/prescriptions', protect,requireRole('pharmacist'), asyncHandler(getPrescriptionQueue));
router.patch('/prescriptions/:prescriptionId/status', protect,requireRole('pharmacist'), asyncHandler(updatePrescriptionStatus));
router.get('/inventory', protect,requireRole('pharmacist'), asyncHandler(getInventory));

export default router;
