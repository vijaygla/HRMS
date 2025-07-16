import Employee from '../models/Employee.js';
import User from '../models/User.js';
import Department from '../models/Department.js';
import mongoose from 'mongoose';

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private
export const getEmployees = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (req.query.department) {
      query['jobInfo.department'] = req.query.department;
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.search) {
      query.$or = [
        { 'personalInfo.firstName': { $regex: req.query.search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: req.query.search, $options: 'i' } },
        { employeeId: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const employees = await Employee.find(query)
      .populate('user', 'email avatar role')
      .populate('jobInfo.department', 'name code')
      .populate('jobInfo.manager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Employee.countDocuments(query);

    res.status(200).json({
      success: true,
      count: employees.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: employees
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees',
      error: error.message
    });
  }
};

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
export const getEmployee = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id)
      .populate('user', 'email avatar role')
      .populate('jobInfo.department', 'name code')
      .populate('jobInfo.manager', 'personalInfo.firstName personalInfo.lastName employeeId');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    res.status(200).json({
      success: true,
      data: employee
    });
  } catch (error) {
    console.error('Get employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee',
      error: error.message
    });
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin/HR/Manager)
export const createEmployee = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('Creating employee with user role:', req.user.role);
    console.log('Request body:', req.body);

    // Check if user has permission to create employees
    const allowedRoles = ['admin', 'hr', 'manager'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to create employees. Only admin, hr, and manager roles can create employees.'
      });
    }

    const { userInfo, personalInfo, jobInfo, salary, benefits, address } = req.body;

    // Validate required fields
    if (!personalInfo?.firstName || !personalInfo?.lastName || !userInfo?.email || !jobInfo?.department || !jobInfo?.position || !salary?.baseSalary) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: firstName, lastName, email, department, position, and baseSalary are required'
      });
    }

    // Check if user with email already exists
    const existingUser = await User.findOne({ email: userInfo.email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Verify department exists
    const department = await Department.findById(jobInfo.department);
    if (!department) {
      return res.status(400).json({
        success: false,
        message: 'Invalid department selected'
      });
    }

    // Role hierarchy validation
    const newEmployeeRole = userInfo.role || 'employee';
    const currentUserRole = req.user.role;

    // Define role hierarchy (higher number = higher authority)
    const roleHierarchy = {
      'employee': 1,
      'manager': 2,
      'hr': 3,
      'admin': 4
    };

    // Check if current user can create this role
    if (roleHierarchy[newEmployeeRole] > roleHierarchy[currentUserRole]) {
      return res.status(403).json({
        success: false,
        message: `You cannot create an employee with ${newEmployeeRole} role. Your role (${currentUserRole}) does not have sufficient privileges.`
      });
    }

    // Managers can only create employees in their department (if they have a department)
    if (currentUserRole === 'manager') {
      const currentUserEmployee = await Employee.findOne({ user: req.user.id });
      if (currentUserEmployee && currentUserEmployee.jobInfo.department.toString() !== jobInfo.department) {
        return res.status(403).json({
          success: false,
          message: 'Managers can only create employees in their own department'
        });
      }
    }

    // Create user account first
    const user = await User.create([{
      name: `${personalInfo.firstName} ${personalInfo.lastName}`,
      email: userInfo.email.toLowerCase().trim(),
      password: userInfo.password || 'defaultPassword123',
      role: newEmployeeRole
    }], { session });

    console.log('User created:', user[0]);

    // Create employee profile
    const employeeData = {
      user: user[0]._id,
      personalInfo: {
        firstName: personalInfo.firstName.trim(),
        lastName: personalInfo.lastName.trim(),
        dateOfBirth: personalInfo.dateOfBirth || undefined,
        gender: personalInfo.gender || undefined,
        maritalStatus: personalInfo.maritalStatus || undefined,
        nationality: personalInfo.nationality?.trim() || undefined,
        phone: personalInfo.phone?.trim() || undefined,
        emergencyContact: personalInfo.emergencyContact || {}
      },
      address: address || {},
      jobInfo: {
        department: jobInfo.department,
        position: jobInfo.position.trim(),
        employmentType: jobInfo.employmentType || 'full-time',
        joinDate: jobInfo.joinDate || new Date(),
        workLocation: jobInfo.workLocation || 'office',
        manager: jobInfo.manager || undefined
      },
      salary: {
        baseSalary: Number(salary.baseSalary),
        currency: salary.currency || 'USD',
        payFrequency: salary.payFrequency || 'monthly'
      },
      benefits: benefits || {
        healthInsurance: false,
        dentalInsurance: false,
        visionInsurance: false,
        retirement401k: false
      },
      status: 'active'
    };

    const employee = await Employee.create([employeeData], { session });
    console.log('Employee created:', employee[0]);

    // Commit transaction
    await session.commitTransaction();

    // Populate the created employee for response
    const populatedEmployee = await Employee.findById(employee[0]._id)
      .populate('user', 'email avatar role')
      .populate('jobInfo.department', 'name code');

    res.status(201).json({
      success: true,
      message: 'Employee created successfully',
      data: populatedEmployee
    });
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    console.error('Create employee error:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. ')
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Employee with this email or employee ID already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create employee',
      error: error.message
    });
  } finally {
    session.endSession();
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin/HR/Manager)
export const updateEmployee = async (req, res) => {
  try {
    // Check permissions
    const allowedRoles = ['admin', 'hr', 'manager'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to update employees'
      });
    }

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Managers can only update employees in their department
    if (req.user.role === 'manager') {
      const currentUserEmployee = await Employee.findOne({ user: req.user.id });
      if (currentUserEmployee && employee.jobInfo.department.toString() !== currentUserEmployee.jobInfo.department.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Managers can only update employees in their own department'
        });
      }
    }

    // Update employee fields
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params.id,
      req.body,
      { 
        new: true, 
        runValidators: true 
      }
    ).populate('user', 'email avatar role')
     .populate('jobInfo.department', 'name code');

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      data: updatedEmployee
    });
  } catch (error) {
    console.error('Update employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update employee',
      error: error.message
    });
  }
};

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin/HR)
export const deleteEmployee = async (req, res) => {
  try {
    // Only admin and hr can delete employees
    const allowedRoles = ['admin', 'hr'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete employees. Only admin and hr can delete employees.'
      });
    }

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Soft delete - change status to terminated
    employee.status = 'terminated';
    employee.jobInfo.endDate = new Date();
    await employee.save();

    // Deactivate user account
    if (employee.user) {
      await User.findByIdAndUpdate(employee.user, { isActive: false });
    }

    res.status(200).json({
      success: true,
      message: 'Employee terminated successfully'
    });
  } catch (error) {
    console.error('Delete employee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete employee',
      error: error.message
    });
  }
};

// @desc    Get employees by department
// @route   GET /api/employees/department/:departmentId
// @access  Private
export const getEmployeesByDepartment = async (req, res) => {
  try {
    const employees = await Employee.find({
      'jobInfo.department': req.params.departmentId,
      status: 'active'
    }).populate('user', 'email avatar role')
      .populate('jobInfo.department', 'name code');

    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees
    });
  } catch (error) {
    console.error('Get employees by department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employees by department',
      error: error.message
    });
  }
};

// @desc    Upload employee document
// @route   POST /api/employees/:id/documents
// @access  Private (Admin/HR/Manager)
export const uploadEmployeeDocument = async (req, res) => {
  try {
    const allowedRoles = ['admin', 'hr', 'manager'];
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to upload documents'
      });
    }

    const { name, type, url } = req.body;

    const employee = await Employee.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    employee.documents.push({
      name,
      type,
      url,
      uploadDate: new Date()
    });

    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      data: employee
    });
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message
    });
  }
};

