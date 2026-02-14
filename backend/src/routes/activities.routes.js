import express from 'express';
import { logActivity, getActivities, getActivityStats, syncDeviceData } from '../controllers/activities.controller.js';
import authenticateToken from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authenticateToken, logActivity);
router.get('/', authenticateToken, getActivities);
router.get('/stats', authenticateToken, getActivityStats);
router.post('/device/sync', authenticateToken, syncDeviceData);

export default router;
