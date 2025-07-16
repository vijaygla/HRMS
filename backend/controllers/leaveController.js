import Leave from '../models/Leave.js';
import Employee from '../models/Employee.js';

// @desc    Get all leave requests
// @route   GET /api/leaves
// @access  Private (Admin/HR/Manager)
export const getLeaves = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (req.query.employee) {
      query.employee = req.query.employee;
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.leaveType) {
      query.leaveType = req.query.leaveType;
    }

    const leaves = await Leave.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ appliedDate: -1 });

    const total = await Leave.countDocuments(query);

    res.status(200).json({
      success: true,
      count: leaves.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: leaves
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single leave request
// @route   GET /api/leaves/:id
// @access  Private
export const getLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create leave request
// @route   POST /api/leaves
// @access  Private
export const createLeave = async (req, res) => {
  try {
    // Get employee profile
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const leave = await Leave.create({
      ...req.body,
      employee: employee._id
    });

    res.status(201).json({
      success: true,
      message: 'Leave request submitted successfully',
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update leave request
// @route   PUT /api/leaves/:id
// @access  Private
export const updateLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check if user can update this leave
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee || leave.employee.toString() !== employee._id.toString()) {
      if (!['admin', 'hr', 'manager'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this leave request'
        });
      }
    }

    // Can only update pending leaves
    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only update pending leave requests'
      });
    }

    const updatedLeave = await Leave.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Leave request updated successfully',
      data: updatedLeave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete leave request
// @route   DELETE /api/leaves/:id
// @access  Private
export const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    // Check if user can delete this leave
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee || leave.employee.toString() !== employee._id.toString()) {
      if (!['admin', 'hr'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to delete this leave request'
        });
      }
    }

    // Can only delete pending leaves
    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Can only delete pending leave requests'
      });
    }

    await Leave.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Leave request deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Approve leave request
// @route   PUT /api/leaves/:id/approve
// @access  Private (Admin/HR/Manager)
export const approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave request is not pending'
      });
    }

    // Get approver employee profile
    const approver = await Employee.findOne({ user: req.user.id });

    leave.status = 'approved';
    leave.approvedBy = approver._id;
    leave.approvedDate = new Date();

    await leave.save();

    res.status(200).json({
      success: true,
      message: 'Leave request approved successfully',
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Reject leave request
// @route   PUT /api/leaves/:id/reject
// @access  Private (Admin/HR/Manager)
export const rejectLeave = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave request not found'
      });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Leave request is not pending'
      });
    }

    // Get approver employee profile
    const approver = await Employee.findOne({ user: req.user.id });

    leave.status = 'rejected';
    leave.approvedBy = approver._id;
    leave.approvedDate = new Date();
    leave.rejectionReason = rejectionReason;

    await leave.save();

    res.status(200).json({
      success: true,
      message: 'Leave request rejected successfully',
      data: leave
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get my leave requests
// @route   GET /api/leaves/my-leaves
// @access  Private
export const getMyLeaves = async (req, res) => {
  try {
    // Get employee profile
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const leaves = await Leave.find({ employee: employee._id })
      .skip(skip)
      .limit(limit)
      .sort({ appliedDate: -1 });

    const total = await Leave.countDocuments({ employee: employee._id });

    res.status(200).json({
      success: true,
      count: leaves.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: leaves
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get leave balance
// @route   GET /api/leaves/my-balance
// @access  Private
export const getLeaveBalance = async (req, res) => {
  try {
    // Get employee profile
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const currentYear = new Date().getFullYear();

    // Calculate leave balance for current year
    const leaveStats = await Leave.aggregate([
      {
        $match: {
          employee: employee._id,
          status: 'approved',
          startDate: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: '$leaveType',
          totalDays: { $sum: '$totalDays' }
        }
      }
    ]);

    // Default leave allocations (this should come from company policy)
    const leaveAllocations = {
      annual: 25,
      sick: 10,
      personal: 5,
      maternity: 90,
      paternity: 15,
      emergency: 3,
      unpaid: 0
    };

    const leaveBalance = Object.keys(leaveAllocations).map(leaveType => {
      const used = leaveStats.find(stat => stat._id === leaveType)?.totalDays || 0;
      const allocated = leaveAllocations[leaveType];
      
      return {
        leaveType,
        allocated,
        used,
        remaining: Math.max(0, allocated - used)
      };
    });

    res.status(200).json({
      success: true,
      data: leaveBalance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get leave statistics
// @route   GET /api/leaves/stats/overview
// @access  Private (Admin/HR)
export const getLeaveStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // Leave requests by status
    const statusStats = await Leave.aggregate([
      {
        $match: {
          appliedDate: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Leave requests by type
    const typeStats = await Leave.aggregate([
      {
        $match: {
          appliedDate: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 },
          totalDays: { $sum: '$totalDays' }
        }
      }
    ]);

    // Monthly leave trends
    const monthlyStats = await Leave.aggregate([
      {
        $match: {
          appliedDate: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$appliedDate' },
          count: { $sum: 1 },
          totalDays: { $sum: '$totalDays' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        byStatus: statusStats,
        byType: typeStats,
        monthly: monthlyStats
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

