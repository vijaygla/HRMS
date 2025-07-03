import express from 'express';
import {
  getAttendance,
  getAttendanceById,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  checkIn,
  checkOut,
  getMyAttendance,
  getAttendanceStats,
  getAttendanceReport
} from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateAttendance, validateRequest } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(authorize('admin', 'hr', 'manager'), getAttendance)
  .post(authorize('admin', 'hr'), validateAttendance, validateRequest, createAttendance);

router.route('/:id')
  .get(getAttendanceById)
  .put(authorize('admin', 'hr'), updateAttendance)
  .delete(authorize('admin', 'hr'), deleteAttendance);

// Employee self-service routes
router.post('/check-in', checkIn);
router.post('/check-out', checkOut);
router.get('/my-attendance', getMyAttendance);

// Reports and stats
router.get('/stats/overview', authorize('admin', 'hr', 'manager'), getAttendanceStats);
router.get('/reports/export', authorize('admin', 'hr'), getAttendanceReport);

export default router;