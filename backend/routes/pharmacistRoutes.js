import express from 'express';
const app = express();
const router = express.Router();

import {
    asyncHandler
} from '../utils/asyncHandler.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateRequest } from '../middleware/validateRequestMiddleware.js';



export default router;