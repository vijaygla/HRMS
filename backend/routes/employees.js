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

// Get all employees - accessible by all authenticated users
router.route('/')
  .get(getEmployees)
  .post(authorize('admin', 'hr', 'manager'), createEmployee);
//   validateEmployee, validateRequest, 

// Employee CRUD operations
router.route('/:id')
  .get(getEmployee)
  .put(authorize('admin', 'hr', 'manager'), updateEmployee)
  .delete(authorize('admin', 'hr', 'manager'), deleteEmployee);

// Additional routes
router.get('/department/:departmentId', getEmployeesByDepartment);
router.post('/:id/documents', authorize('admin', 'hr', 'manager'), uploadEmployeeDocument);

export default router;

