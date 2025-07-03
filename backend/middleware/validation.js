import { body, validationResult } from 'express-validator';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
export const validateUserRegistration = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['admin', 'hr', 'manager', 'employee'])
    .withMessage('Invalid role specified')
];

export const validateUserLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Employee validation rules
export const validateEmployee = [
  body('personalInfo.firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('personalInfo.lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('jobInfo.position')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Position must be between 2 and 100 characters'),
  body('jobInfo.department')
    .isMongoId()
    .withMessage('Valid department ID is required'),
  body('salary.baseSalary')
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Base salary must be a positive number')
];

// Department validation rules
export const validateDepartment = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Department name must be between 2 and 50 characters'),
  body('code')
    .trim()
    .isLength({ min: 2, max: 10 })
    .isAlphanumeric()
    .withMessage('Department code must be 2-10 alphanumeric characters'),
  body('budget')
    .optional()
    .isNumeric()
    .isFloat({ min: 0 })
    .withMessage('Budget must be a positive number')
];

// Leave validation rules
export const validateLeave = [
  body('leaveType')
    .isIn(['annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency', 'unpaid'])
    .withMessage('Invalid leave type'),
  body('startDate')
    .isISO8601()
    .withMessage('Valid start date is required'),
  body('endDate')
    .isISO8601()
    .withMessage('Valid end date is required'),
  body('reason')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Reason must be between 10 and 500 characters')
];

// Attendance validation rules
export const validateAttendance = [
  body('employee')
    .isMongoId()
    .withMessage('Valid employee ID is required'),
  body('date')
    .isISO8601()
    .withMessage('Valid date is required'),
  body('checkIn.time')
    .optional()
    .isISO8601()
    .withMessage('Valid check-in time is required'),
  body('checkOut.time')
    .optional()
    .isISO8601()
    .withMessage('Valid check-out time is required')
];