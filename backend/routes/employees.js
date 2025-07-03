import express from 'express';
import {
  getEmployees,
  getEmployee,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeesByDepartment,
  uploadEmployeeDocument
} from '../controllers/employeeController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validateEmployee, validateRequest } from '../middleware/validation.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getEmployees)
  .post(authorize('admin', 'hr'), validateEmployee, validateRequest, createEmployee);

router.route('/:id')
  .get(getEmployee)
  .put(authorize('admin', 'hr'), updateEmployee)
  .delete(authorize('admin', 'hr'), deleteEmployee);

router.get('/department/:departmentId', getEmployeesByDepartment);
router.post('/:id/documents', authorize('admin', 'hr'), uploadEmployeeDocument);

export default router;