import express from 'express';
import { addPlaceReview, updateReview, deleteReview, getRouteReviews } from '../controllers/reviews.controller.js';
import authenticateToken from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authenticateToken, addPlaceReview);
router.put('/:reviewId', authenticateToken, updateReview);
router.delete('/:reviewId', authenticateToken, deleteReview);
router.get('/route/:routeId', getRouteReviews);

export default router;
