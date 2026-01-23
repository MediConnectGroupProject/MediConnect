import express from "express";
const app = express();
const router = express.Router();

import {
    asyncHandler
} from '../utils/asyncHandler.js';
import {
    protect
} from '../middleware/authMiddleware.js';
import {
    requireRole
} from '../middleware/requireRole.js';
import {
    getAllUsers,
    getUserCount,
    getRoles,
    changeRoleStatus,
    changeUserStatus,
    addRole,
    getDashboardStats,
    getSystemHealth,
    getSystemReport
} from '../controllers/adminController.js';

// user related routes
router.get('/stats', protect, requireRole(['ADMIN']), asyncHandler(getDashboardStats));
router.get('/health', protect, requireRole(['ADMIN']), asyncHandler(getSystemHealth));
router.get('/reports', protect, requireRole(['ADMIN']), asyncHandler(getSystemReport));

router.get('/users/count', protect, requireRole(['ADMIN']), asyncHandler(getUserCount));
router.get('/users', protect, requireRole(['ADMIN']), asyncHandler(getAllUsers));
router.get('/roles', protect, requireRole(['ADMIN']), asyncHandler(getRoles));
router.patch('/roles/user/:userId/role/:roleId', protect, requireRole(['ADMIN']), asyncHandler(changeRoleStatus));
router.post('/users/:userId', protect, requireRole(['ADMIN']), asyncHandler(addRole));
router.patch('/users/:userId', protect, requireRole(['ADMIN']), asyncHandler(changeUserStatus));

export default router;