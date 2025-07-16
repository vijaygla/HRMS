import Department from '../models/Department.js';
import Employee from '../models/Employee.js';

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('manager', 'personalInfo.firstName personalInfo.lastName employeeId')
      .sort({ name: 1 });

    // Get employee count for each department
    const departmentsWithCount = await Promise.all(
      departments.map(async (dept) => {
        const employeeCount = await Employee.countDocuments({
          'jobInfo.department': dept._id,
          status: 'active'
        });
        
        return {
          ...dept.toObject(),
          employeeCount
        };
      })
    );

    res.status(200).json({
      success: true,
      count: departmentsWithCount.length,
      data: departmentsWithCount
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch departments',
      error: error.message
    });
  }
};

// @desc    Get single department
// @route   GET /api/departments/:id
// @access  Private
export const getDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('manager', 'personalInfo.firstName personalInfo.lastName employeeId');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Get employee count
    const employeeCount = await Employee.countDocuments({
      'jobInfo.department': req.params.id,
      status: 'active'
    });

    res.status(200).json({
      success: true,
      data: {
        ...department.toObject(),
        employeeCount
      }
    });
  } catch (error) {
    console.error('Get department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department',
      error: error.message
    });
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private (Admin/HR)
export const createDepartment = async (req, res) => {
  try {
    const { name, code, description, budget, location, manager } = req.body;

    // Validate required fields
    if (!name || !code) {
      return res.status(400).json({
        success: false,
        message: 'Department name and code are required'
      });
    }

    // Check if department with same name or code exists
    const existingDept = await Department.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        { code: code.toUpperCase() }
      ]
    });

    if (existingDept) {
      return res.status(400).json({
        success: false,
        message: 'Department with this name or code already exists'
      });
    }

    // Create department
    const department = await Department.create({
      name: name.trim(),
      code: code.toUpperCase().trim(),
      description: description?.trim(),
      budget: budget ? Number(budget) : undefined,
      location: location?.trim(),
      manager: manager || undefined,
      establishedDate: new Date()
    });

    // Populate the created department
    const populatedDepartment = await Department.findById(department._id)
      .populate('manager', 'personalInfo.firstName personalInfo.lastName employeeId');

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: populatedDepartment
    });
  } catch (error) {
    console.error('Create department error:', error);
    
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
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        success: false,
        message: `Department ${field} already exists`
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create department',
      error: error.message
    });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin/HR)
export const updateDepartment = async (req, res) => {
  try {
    const { name, code, description, budget, location, manager } = req.body;

    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check for duplicate name or code (excluding current department)
    if (name || code) {
      const query = {
        _id: { $ne: req.params.id },
        $or: []
      };

      if (name) {
        query.$or.push({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
      }
      if (code) {
        query.$or.push({ code: code.toUpperCase() });
      }

      const existingDept = await Department.findOne(query);
      if (existingDept) {
        return res.status(400).json({
          success: false,
          message: 'Department with this name or code already exists'
        });
      }
    }

    // Update fields
    if (name) department.name = name.trim();
    if (code) department.code = code.toUpperCase().trim();
    if (description !== undefined) department.description = description.trim();
    if (budget !== undefined) department.budget = budget ? Number(budget) : undefined;
    if (location !== undefined) department.location = location.trim();
    if (manager !== undefined) department.manager = manager || undefined;

    await department.save();

    // Populate the updated department
    const populatedDepartment = await Department.findById(department._id)
      .populate('manager', 'personalInfo.firstName personalInfo.lastName employeeId');

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: populatedDepartment
    });
  } catch (error) {
    console.error('Update department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update department',
      error: error.message
    });
  }
};

// @desc    Delete department
// @route   DELETE /api/departments/:id
// @access  Private (Admin)
export const deleteDepartment = async (req, res) => {
  try {
    const department = await Department.findById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    // Check if department has active employees
    const employeeCount = await Employee.countDocuments({
      'jobInfo.department': req.params.id,
      status: 'active'
    });

    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. It has ${employeeCount} active employee(s). Please reassign or remove employees first.`
      });
    }

    // Soft delete - mark as inactive
    department.isActive = false;
    await department.save();

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete department',
      error: error.message
    });
  }
};

// @desc    Get department statistics
// @route   GET /api/departments/:id/stats
// @access  Private
export const getDepartmentStats = async (req, res) => {
  try {
    const departmentId = req.params.id;

    // Check if department exists
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const stats = await Employee.aggregate([
      {
        $match: {
          'jobInfo.department': departmentId,
          status: 'active'
        }
      },
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          averageSalary: { $avg: '$salary.baseSalary' },
          totalSalaryBudget: { $sum: '$salary.baseSalary' }
        }
      }
    ]);

    const employmentTypes = await Employee.aggregate([
      {
        $match: {
          'jobInfo.department': departmentId,
          status: 'active'
        }
      },
      {
        $group: {
          _id: '$jobInfo.employmentType',
          count: { $sum: 1 }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        overview: stats[0] || {
          totalEmployees: 0,
          averageSalary: 0,
          totalSalaryBudget: 0
        },
        employmentTypes
      }
    });
  } catch (error) {
    console.error('Get department stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch department statistics',
      error: error.message
    });
  }
};
