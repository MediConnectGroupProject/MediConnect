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
    getDashboardStats
} from '../controllers/pharmacistController.js';
import {
    addBatch,
    getInventoryWithBatches,
    addSupplier,
    getSuppliers,
    getInventoryAlerts
} from '../controllers/inventoryController.js';
import { processSale } from '../controllers/salesController.js';
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

// Dashboard Stats
router.get('/stats', protect, requireRole('PHARMACIST'), asyncHandler(getDashboardStats));

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

// prescription queue
router.get('/prescriptions', protect,requireRole('PHARMACIST'), asyncHandler(getPrescriptionQueue));
router.patch('/prescriptions/:prescriptionId/status', protect,requireRole('PHARMACIST'), asyncHandler(updatePrescriptionStatus));

// inventory
// router.get('/inventory', protect, requireRole('PHARMACIST'), asyncHandler(getInventory)); // Old
router.get('/inventory', protect, requireRole('PHARMACIST'), asyncHandler(getInventoryWithBatches)); // New Batch-aware logic
router.get('/inventory/alerts', protect, requireRole('PHARMACIST'), asyncHandler(getInventoryAlerts)); // Alerts endpoint

router.post('/inventory', protect, requireRole('PHARMACIST'), validateRequest(addInventorySchema), asyncHandler(addInventory)); // Keeping for legacy add (or we should replace?)
// Let's keep the old addInventory for now, but also expose the new addBatch

router.post('/batch', protect, requireRole('PHARMACIST'), asyncHandler(addBatch)); // New Batch Add

router.patch('/inventory/:inventoryId', protect, requireRole('PHARMACIST'), validateRequest(updateInventorySchema), asyncHandler(updateInventory));

// Supplier Routes
router.get('/suppliers', protect, requireRole('PHARMACIST'), asyncHandler(getSuppliers));
router.post('/suppliers', protect, requireRole('PHARMACIST'), asyncHandler(addSupplier));

// Sales
router.post('/sale', protect, requireRole('PHARMACIST'), asyncHandler(processSale));

export default router;