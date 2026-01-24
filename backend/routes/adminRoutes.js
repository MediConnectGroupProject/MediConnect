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
    getSystemReport,
    createUser,
    deleteUser,
    removeRole,
    getUserDetails,
    getAuditLogs,
    revokeStaffSessions,
    getActiveStaff
} from '../controllers/adminController.js';

// user related routes
router.post('/users', protect, requireRole(['ADMIN']), asyncHandler(createUser));
router.get('/stats', protect, requireRole(['ADMIN']), asyncHandler(getDashboardStats));
router.get('/health', protect, requireRole(['ADMIN']), asyncHandler(getSystemHealth));
router.get('/reports', protect, requireRole(['ADMIN']), asyncHandler(getSystemReport));
router.get('/logs', protect, requireRole(['ADMIN']), asyncHandler(getAuditLogs));
router.get('/active-staff', protect, requireRole(['ADMIN']), asyncHandler(getActiveStaff));
router.post('/revoke-sessions', protect, requireRole(['ADMIN']), asyncHandler(revokeStaffSessions));

router.get('/users/count', protect, requireRole(['ADMIN']), asyncHandler(getUserCount));
router.get('/users', protect, requireRole(['ADMIN']), asyncHandler(getAllUsers));
router.get('/roles', protect, requireRole(['ADMIN']), asyncHandler(getRoles));
router.get('/users.count', protect, requireRole(['ADMIN']), asyncHandler(getUserCount)); // This was likely existing or implicit, but let's check. 
// Actually line 35 is count.
// Adding route for single user details.
router.get('/users/:userId', protect, requireRole(['ADMIN']), asyncHandler(getUserDetails));
router.patch('/roles/user/:userId/role/:roleId', protect, requireRole(['ADMIN']), asyncHandler(changeRoleStatus));
router.delete('/roles/user/:userId/role/:roleId', protect, requireRole(['ADMIN']), asyncHandler(removeRole));
router.post('/users/:userId', protect, requireRole(['ADMIN']), asyncHandler(addRole));
router.patch('/users/:userId', protect, requireRole(['ADMIN']), asyncHandler(changeUserStatus));
router.delete('/users/:userId', protect, requireRole(['ADMIN']), asyncHandler(deleteUser));

export default router;