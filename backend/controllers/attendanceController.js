import Attendance from '../models/Attendance.js';
import Employee from '../models/Employee.js';
import mongoose from 'mongoose';

// @desc    Create attendance record
// @route   POST /api/attendance
// @access  Private (Admin/HR)
export const createAttendance = async (req, res) => {
  try {
    console.log('Request body:', req.body);
    
    // Validate required fields
    if (!req.body.employee) {
      return res.status(400).json({
        success: false,
        message: 'Employee ID is required'
      });
    }

    // Validate employee exists
    const employee = await Employee.findById(req.body.employee);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if attendance record already exists for this date
    const existingAttendance = await Attendance.findOne({
      employee: req.body.employee,
      date: {
        $gte: new Date(new Date(req.body.date).setHours(0, 0, 0, 0)),
        $lt: new Date(new Date(req.body.date).setHours(23, 59, 59, 999))
      }
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance record already exists for this date'
      });
    }

    // Create attendance record
    const attendanceData = {
      employee: req.body.employee,
      date: new Date(req.body.date),
      checkIn: req.body.checkIn,
      checkOut: req.body.checkOut,
      status: req.body.status || 'present',
      isManualEntry: true
    };

    console.log('Attendance data to create:', attendanceData);

    const attendance = await Attendance.create(attendanceData);

    // Calculate working hours if both checkIn and checkOut are provided
    if (attendance.checkIn && attendance.checkIn.time && attendance.checkOut && attendance.checkOut.time) {
      attendance.calculateWorkingHours();
      await attendance.save();
    }

    res.status(201).json({
      success: true,
      message: 'Attendance record created successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Error creating attendance:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate attendance record'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all attendance records
// @route   GET /api/attendance
// @access  Private (Admin/HR/Manager)
export const getAttendance = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (req.query.employee) {
      // Validate ObjectId format
      if (!mongoose.Types.ObjectId.isValid(req.query.employee)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid employee ID format'
        });
      }
      query.employee = req.query.employee;
    }
    
    if (req.query.date) {
      const date = new Date(req.query.date);
      if (isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid date format'
        });
      }
      query.date = {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999))
      };
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }

    console.log('Query:', query);

    const attendance = await Attendance.find(query)
      .populate({
        path: 'employee',
        select: 'personalInfo.firstName personalInfo.lastName employeeId jobInfo.department',
        populate: {
          path: 'jobInfo.department',
          select: 'name'
        }
      })
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 });

    const total = await Attendance.countDocuments(query);

    res.status(200).json({
      success: true,
      count: attendance.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: attendance
    });
  } catch (error) {
    console.error('Error getting attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single attendance record
// @route   GET /api/attendance/:id
// @access  Private
export const getAttendanceById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance ID format'
      });
    }

    const attendance = await Attendance.findById(req.params.id)
      .populate({
        path: 'employee',
        select: 'personalInfo.firstName personalInfo.lastName employeeId jobInfo.department',
        populate: {
          path: 'jobInfo.department',
          select: 'name'
        }
      });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: attendance
    });
  } catch (error) {
    console.error('Error getting attendance by ID:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update attendance record
// @route   PUT /api/attendance/:id
// @access  Private (Admin/HR)
export const updateAttendance = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance ID format'
      });
    }

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Recalculate working hours
    if (attendance.checkIn && attendance.checkIn.time && attendance.checkOut && attendance.checkOut.time) {
      attendance.calculateWorkingHours();
      await attendance.save();
    }

    res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete attendance record
// @route   DELETE /api/attendance/:id
// @access  Private (Admin/HR)
export const deleteAttendance = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance ID format'
      });
    }

    const attendance = await Attendance.findByIdAndDelete(req.params.id);

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Check in
// @route   POST /api/attendance/check-in
// @access  Private
export const checkIn = async (req, res) => {
  try {
    // Get employee profile
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already checked in today
    const existingAttendance = await Attendance.findOne({
      employee: employee._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (existingAttendance && existingAttendance.checkIn && existingAttendance.checkIn.time) {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today'
      });
    }

    const checkInData = {
      time: new Date(),
      location: req.body.location || 'office',
      ipAddress: req.ip,
      coordinates: req.body.coordinates
    };

    let attendance;
    if (existingAttendance) {
      existingAttendance.checkIn = checkInData;
      attendance = await existingAttendance.save();
    } else {
      attendance = await Attendance.create({
        employee: employee._id,
        date: new Date(),
        checkIn: checkInData,
        status: 'present'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Checked in successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Error checking in:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Check out
// @route   POST /api/attendance/check-out
// @access  Private
export const checkOut = async (req, res) => {
  try {
    // Get employee profile
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee profile not found'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find today's attendance
    const attendance = await Attendance.findOne({
      employee: employee._id,
      date: {
        $gte: today,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
      }
    });

    if (!attendance || !attendance.checkIn || !attendance.checkIn.time) {
      return res.status(400).json({
        success: false,
        message: 'No check-in record found for today'
      });
    }

    if (attendance.checkOut && attendance.checkOut.time) {
      return res.status(400).json({
        success: false,
        message: 'Already checked out today'
      });
    }

    attendance.checkOut = {
      time: new Date(),
      location: req.body.location || 'office',
      ipAddress: req.ip,
      coordinates: req.body.coordinates
    };

    // Calculate working hours
    attendance.calculateWorkingHours();
    await attendance.save();

    res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: attendance
    });
  } catch (error) {
    console.error('Error checking out:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get my attendance
// @route   GET /api/attendance/my-attendance
// @access  Private
export const getMyAttendance = async (req, res) => {
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

    const attendance = await Attendance.find({ employee: employee._id })
      .skip(skip)
      .limit(limit)
      .sort({ date: -1 });

    const total = await Attendance.countDocuments({ employee: employee._id });

    res.status(200).json({
      success: true,
      count: attendance.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: attendance
    });
  } catch (error) {
    console.error('Error getting my attendance:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get attendance statistics
// @route   GET /api/attendance/stats/overview
// @access  Private (Admin/HR/Manager)
export const getAttendanceStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Today's stats
    const todayStats = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
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

    // This month's stats
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthStats = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: monthStart,
            $lt: today
          }
        }
      },
      {
        $group: {
          _id: null,
          totalWorkingHours: { $sum: '$workingHours' },
          totalOvertimeHours: { $sum: '$overtimeHours' },
          averageWorkingHours: { $avg: '$workingHours' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        today: todayStats,
        thisMonth: monthStats[0] || {
          totalWorkingHours: 0,
          totalOvertimeHours: 0,
          averageWorkingHours: 0
        }
      }
    });
  } catch (error) {
    console.error('Error getting attendance stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get attendance report
// @route   GET /api/attendance/reports/export
// @access  Private (Admin/HR)
export const getAttendanceReport = async (req, res) => {
  try {
    const { startDate, endDate, department, format } = req.query;

    let query = {};
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (department) {
      // Get employees from specific department
      const employees = await Employee.find({
        'jobInfo.department': department
      }).select('_id');
      
      query.employee = { $in: employees.map(emp => emp._id) };
    }

    const attendance = await Attendance.find(query)
      .populate({
        path: 'employee',
        select: 'personalInfo.firstName personalInfo.lastName employeeId jobInfo.department',
        populate: {
          path: 'jobInfo.department',
          select: 'name'
        }
      })
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    console.error('Error generating attendance report:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};