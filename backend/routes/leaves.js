import express from 'express';
import {
  getLeaves,
  getLeave,
  createLeave,
  updateLeave,
  deleteLeave,
  approveLeave,
  rejectLeave,
  getMyLeaves,
  getLeaveBalance,
  getLeaveStats
} from '../controllers/leaveController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateLeave, validateRequest } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(authorize('admin', 'hr', 'manager'), getLeaves)
  .post(validateLeave, validateRequest, createLeave);

router.route('/:id')
  .get(getLeave)
  .put(updateLeave)
  .delete(deleteLeave);

// Leave approval routes
router.put('/:id/approve', authorize('admin', 'hr', 'manager'), approveLeave);
router.put('/:id/reject', authorize('admin', 'hr', 'manager'), rejectLeave);

// Employee self-service routes
router.get('/my-leaves', getMyLeaves);
router.get('/my-balance', getLeaveBalance);

// Stats and reports
router.get('/stats/overview', authorize('admin', 'hr'), getLeaveStats);

export default router;