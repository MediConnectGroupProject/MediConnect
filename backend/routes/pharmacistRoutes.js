import express from 'express';
import {
    getPrescriptionQueue,
    updatePrescriptionStatus,
    getInventory,
    addInventory,
    updateInventory,
    addMedicine,
    updateMedicine,
    addDosage,
    updateDosage,
    getDosage,
    getCategory,
    addCategory,
    updateCategory,
} from '../controllers/pharmacistController.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireRole } from '../middleware/requireRole.js';
import { protect } from '../middleware/authMiddleware.js';
import {
    addMedicineCatSchema, updateMedicineCatSchema,
    addDosageSchema, updateDosageSchema,
    addInventorySchema, updateInventorySchema,
    addMedicineSchema, updateMedicineSchema
} from '../validators/MedicineValidator.js';
import { validateRequest } from '../middleware/validateRequestMiddleware.js';

const router = express.Router();

// add & update medicine
router.post('/medicine', protect, requireRole('PHARMACIST'),validateRequest(addMedicineSchema), asyncHandler(addMedicine));
router.patch('/medicine/:medicineId', protect, requireRole('PHARMACIST'),validateRequest(updateMedicineSchema), asyncHandler(updateMedicine));

// add & update dosage
router.get('/dosage', protect, requireRole('PHARMACIST'), asyncHandler(getDosage));
router.post('/dosage', protect, requireRole('PHARMACIST'), validateRequest(addDosageSchema), asyncHandler(addDosage));
router.patch('/dosage/:dosageId', protect, requireRole('PHARMACIST'), validateRequest(updateDosageSchema), asyncHandler(updateDosage));

// add & update category
router.get('/category', protect, requireRole('PHARMACIST'), asyncHandler(getCategory));
router.post('/category', protect, requireRole('PHARMACIST'), validateRequest(addMedicineCatSchema), asyncHandler(addCategory));
router.patch('/category/:categoryId', protect, requireRole('PHARMACIST'), validateRequest(updateMedicineCatSchema), asyncHandler(updateCategory));

// // prescription queue
// router.get('/prescriptions', protect,requireRole('PHARMACIST'), asyncHandler(getPrescriptionQueue));
// router.patch('/prescriptions/:prescriptionId/status', protect,requireRole('PHARMACIST'), asyncHandler(updatePrescriptionStatus));

// inventory
router.get('/inventory', protect, requireRole('PHARMACIST'), asyncHandler(getInventory));
router.post('/inventory', protect, requireRole('PHARMACIST'), validateRequest(addInventorySchema), asyncHandler(addInventory));
router.patch('/inventory/:inventoryId', protect, requireRole('PHARMACIST'), validateRequest(updateInventorySchema), asyncHandler(updateInventory));

export default router;