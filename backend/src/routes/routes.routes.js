import express from 'express';
import { createRoute, updateRoute, getRoutes, getRouteById, joinRoute } from '../controllers/routes.controller.js';
import authenticateToken from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authenticateToken, createRoute);
router.put('/:routeId', authenticateToken, updateRoute);
router.get('/', getRoutes);
router.get('/:routeId', getRouteById);
router.post('/:routeId/join', authenticateToken, joinRoute);

export default router;
