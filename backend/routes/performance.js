import express from 'express';
import {
  getPerformanceReviews,
  getPerformanceReview,
  createPerformanceReview,
  updatePerformanceReview,
  deletePerformanceReview,
  submitReview,
  acknowledgeReview,
  getMyPerformanceReviews,
  getPerformanceStats
} from '../controllers/performanceController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(authorize('admin', 'hr', 'manager'), getPerformanceReviews)
  .post(authorize('admin', 'hr', 'manager'), createPerformanceReview);

router.route('/:id')
  .get(getPerformanceReview)
  .put(updatePerformanceReview)
  .delete(authorize('admin', 'hr'), deletePerformanceReview);

// Review workflow routes
router.put('/:id/submit', authorize('admin', 'hr', 'manager'), submitReview);
router.put('/:id/acknowledge', acknowledgeReview);

// Employee self-service routes
router.get('/my-reviews', getMyPerformanceReviews);

// Stats and reports
router.get('/stats/overview', authorize('admin', 'hr'), getPerformanceStats);

export default router;