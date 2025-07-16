import express from 'express';
import {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getDepartmentStats
} from '../controllers/departmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateDepartment, validateRequest } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getDepartments)
  .post(authorize('admin', 'hr'), validateDepartment, validateRequest, createDepartment);

router.route('/:id')
  .get(getDepartment)
  .put(authorize('admin', 'hr'), updateDepartment)
  .delete(authorize('admin'), deleteDepartment);

router.get('/:id/stats', getDepartmentStats);

export default router;

