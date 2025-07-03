import express from 'express';
import {
  getPayrolls,
  getPayroll,
  createPayroll,
  updatePayroll,
  deletePayroll,
  calculatePayroll,
  approvePayroll,
  getMyPayroll,
  getPayrollStats,
  generatePayslip
} from '../controllers/payrollController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(authorize('admin', 'hr'), getPayrolls)
  .post(authorize('admin', 'hr'), createPayroll);

router.route('/:id')
  .get(authorize('admin', 'hr'), getPayroll)
  .put(authorize('admin', 'hr'), updatePayroll)
  .delete(authorize('admin'), deletePayroll);

// Payroll processing routes
router.post('/calculate/:employeeId', authorize('admin', 'hr'), calculatePayroll);
router.put('/:id/approve', authorize('admin', 'hr'), approvePayroll);

// Employee self-service routes
router.get('/my-payroll', getMyPayroll);
router.get('/:id/payslip', generatePayslip);

// Stats and reports
router.get('/stats/overview', authorize('admin', 'hr'), getPayrollStats);

export default router;