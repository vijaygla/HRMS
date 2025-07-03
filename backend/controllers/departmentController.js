import Department from '../models/Department.js';
import Employee from '../models/Employee.js';

// @desc    Get all departments
// @route   GET /api/departments
// @access  Private
export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('employeeCount')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: departments.length,
      data: departments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
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
      .populate('employeeCount')
      .populate('subdepartments');

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.status(200).json({
      success: true,
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private (Admin/HR)
export const createDepartment = async (req, res) => {
  try {
    const department = await Department.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin/HR)
export const updateDepartment = async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
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

    // Check if department has employees
    const employeeCount = await Employee.countDocuments({
      'jobInfo.department': req.params.id,
      status: 'active'
    });

    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete department with active employees'
      });
    }

    // Soft delete
    department.isActive = false;
    await department.save();

    res.status(200).json({
      success: true,
      message: 'Department deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
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
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};