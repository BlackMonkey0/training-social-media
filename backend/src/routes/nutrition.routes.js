import express from 'express';
import { logNutrition, getNutritionLogs, getNutritionStats, addFoodCustom } from '../controllers/nutrition.controller.js';
import authenticateToken from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authenticateToken, logNutrition);
router.get('/', authenticateToken, getNutritionLogs);
router.get('/stats', authenticateToken, getNutritionStats);
router.post('/food/custom', authenticateToken, addFoodCustom);

export default router;
