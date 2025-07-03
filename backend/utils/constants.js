// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  HR: 'hr',
  MANAGER: 'manager',
  EMPLOYEE: 'employee'
};

// Employee status
export const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  TERMINATED: 'terminated',
  ON_LEAVE: 'on-leave'
};

// Employment types
export const EMPLOYMENT_TYPES = {
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  CONTRACT: 'contract',
  INTERN: 'intern'
};

// Work locations
export const WORK_LOCATIONS = {
  OFFICE: 'office',
  REMOTE: 'remote',
  HYBRID: 'hybrid'
};

// Attendance status
export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  HALF_DAY: 'half-day',
  ON_LEAVE: 'on-leave'
};

// Leave types
export const LEAVE_TYPES = {
  ANNUAL: 'annual',
  SICK: 'sick',
  PERSONAL: 'personal',
  MATERNITY: 'maternity',
  PATERNITY: 'paternity',
  EMERGENCY: 'emergency',
  UNPAID: 'unpaid'
};

// Leave status
export const LEAVE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
};

// Payroll status
export const PAYROLL_STATUS = {
  DRAFT: 'draft',
  CALCULATED: 'calculated',
  APPROVED: 'approved',
  PAID: 'paid',
  CANCELLED: 'cancelled'
};

// Payment methods
export const PAYMENT_METHODS = {
  BANK_TRANSFER: 'bank-transfer',
  CHECK: 'check',
  CASH: 'cash',
  DIGITAL_WALLET: 'digital-wallet'
};

// Performance review types
export const REVIEW_TYPES = {
  QUARTERLY: 'quarterly',
  SEMI_ANNUAL: 'semi-annual',
  ANNUAL: 'annual',
  PROBATION: 'probation',
  PROJECT_BASED: 'project-based'
};

// Performance review status
export const REVIEW_STATUS = {
  DRAFT: 'draft',
  IN_REVIEW: 'in-review',
  COMPLETED: 'completed',
  ACKNOWLEDGED: 'acknowledged'
};

// Goal status
export const GOAL_STATUS = {
  NOT_STARTED: 'not-started',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  OVERDUE: 'overdue',
  CANCELLED: 'cancelled'
};

// Competency categories
export const COMPETENCY_CATEGORIES = {
  TECHNICAL: 'technical',
  BEHAVIORAL: 'behavioral',
  LEADERSHIP: 'leadership',
  COMMUNICATION: 'communication'
};

// Development plan status
export const DEVELOPMENT_STATUS = {
  PLANNED: 'planned',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// API response messages
export const MESSAGES = {
  SUCCESS: {
    CREATED: 'Resource created successfully',
    UPDATED: 'Resource updated successfully',
    DELETED: 'Resource deleted successfully',
    FETCHED: 'Resource fetched successfully'
  },
  ERROR: {
    NOT_FOUND: 'Resource not found',
    UNAUTHORIZED: 'Not authorized to access this resource',
    FORBIDDEN: 'Access forbidden',
    VALIDATION_FAILED: 'Validation failed',
    SERVER_ERROR: 'Internal server error',
    DUPLICATE_ENTRY: 'Duplicate entry found'
  }
};

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100
};

// File upload limits
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
};

// Date formats
export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  DISPLAY: 'DD/MM/YYYY',
  DATETIME: 'YYYY-MM-DD HH:mm:ss'
};

// Default leave allocations (annual)
export const DEFAULT_LEAVE_ALLOCATIONS = {
  annual: 25,
  sick: 10,
  personal: 5,
  maternity: 90,
  paternity: 15,
  emergency: 3,
  unpaid: 0
};

// Working hours
export const WORKING_HOURS = {
  STANDARD_HOURS_PER_DAY: 8,
  STANDARD_DAYS_PER_WEEK: 5,
  STANDARD_HOURS_PER_WEEK: 40,
  OVERTIME_MULTIPLIER: 1.5
};

// Tax rates (simplified - should be configurable)
export const TAX_RATES = {
  FEDERAL: 0.15,
  STATE: 0.05,
  LOCAL: 0.02,
  SOCIAL_SECURITY: 0.062,
  MEDICARE: 0.0145
};