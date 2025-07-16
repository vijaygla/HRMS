import Payroll from '../models/Payroll.js';
import Employee from '../models/Employee.js';
import Attendance from '../models/Attendance.js';

// @desc    Get all payroll records
// @route   GET /api/payroll
// @access  Private (Admin/HR)
export const getPayrolls = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (req.query.employee) {
      query.employee = req.query.employee;
    }
    
    if (req.query.month) {
      query['payPeriod.month'] = parseInt(req.query.month);
    }
    
    if (req.query.year) {
      query['payPeriod.year'] = parseInt(req.query.year);
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }

    const payrolls = await Payroll.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ 'payPeriod.year': -1, 'payPeriod.month': -1 });

    const total = await Payroll.countDocuments(query);

    res.status(200).json({
      success: true,
      count: payrolls.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: payrolls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single payroll record
// @route   GET /api/payroll/:id
// @access  Private (Admin/HR)
export const getPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    res.status(200).json({
      success: true,
      data: payroll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create payroll record
// @route   POST /api/payroll
// @access  Private (Admin/HR)
export const createPayroll = async (req, res) => {
  try {
    const payroll = await Payroll.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Payroll record created successfully',
      data: payroll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update payroll record
// @route   PUT /api/payroll/:id
// @access  Private (Admin/HR)
export const updatePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payroll record updated successfully',
      data: payroll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete payroll record
// @route   DELETE /api/payroll/:id
// @access  Private (Admin)
export const deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Payroll record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Calculate payroll for employee
// @route   POST /api/payroll/calculate/:employeeId
// @access  Private (Admin/HR)
export const calculatePayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    const employeeId = req.params.employeeId;

    // Get employee details
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Check if payroll already exists
    const existingPayroll = await Payroll.findOne({
      employee: employeeId,
      'payPeriod.month': month,
      'payPeriod.year': year
    });

    if (existingPayroll) {
      return res.status(400).json({
        success: false,
        message: 'Payroll already exists for this period'
      });
    }

    // Calculate pay period dates
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // Get attendance data for the period
    const attendanceRecords = await Attendance.find({
      employee: employeeId,
      date: { $gte: startDate, $lte: endDate }
    });

    // Calculate attendance metrics
    const workingDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(record => 
      record.status === 'present' || record.status === 'late'
    ).length;
    const absentDays = attendanceRecords.filter(record => 
      record.status === 'absent'
    ).length;
    const leaveDays = attendanceRecords.filter(record => 
      record.status === 'on-leave'
    ).length;
    const totalOvertimeHours = attendanceRecords.reduce((sum, record) => 
      sum + (record.overtimeHours || 0), 0
    );

    // Calculate earnings
    const baseSalary = employee.salary.baseSalary;
    const overtimeRate = baseSalary / (30 * 8) * 1.5; // 1.5x hourly rate
    const overtimeAmount = totalOvertimeHours * overtimeRate;

    // Calculate deductions (simplified)
    const federalTax = baseSalary * 0.15; // 15% federal tax
    const stateTax = baseSalary * 0.05; // 5% state tax
    const healthInsurance = employee.benefits.healthInsurance ? 200 : 0;
    const retirement = baseSalary * 0.06; // 6% retirement contribution

    // Create payroll record
    const payrollData = {
      employee: employeeId,
      payPeriod: {
        startDate,
        endDate,
        month,
        year
      },
      earnings: {
        baseSalary,
        overtime: {
          hours: totalOvertimeHours,
          rate: overtimeRate,
          amount: overtimeAmount
        },
        bonuses: {
          performance: 0,
          holiday: 0,
          other: 0
        },
        allowances: {
          transport: 0,
          meal: 0,
          housing: 0,
          other: 0
        }
      },
      deductions: {
        tax: {
          federal: federalTax,
          state: stateTax,
          local: 0
        },
        insurance: {
          health: healthInsurance,
          dental: 0,
          vision: 0,
          life: 0
        },
        retirement,
        other: 0
      },
      attendance: {
        workingDays,
        presentDays,
        absentDays,
        leaveDays,
        overtimeHours: totalOvertimeHours
      },
      status: 'calculated',
      processedBy: req.user.id,
      processedDate: new Date()
    };

    const payroll = await Payroll.create(payrollData);

    res.status(201).json({
      success: true,
      message: 'Payroll calculated successfully',
      data: payroll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Approve payroll
// @route   PUT /api/payroll/:id/approve
// @access  Private (Admin/HR)
export const approvePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    if (payroll.status !== 'calculated') {
      return res.status(400).json({
        success: false,
        message: 'Payroll must be calculated before approval'
      });
    }

    payroll.status = 'approved';
    payroll.processedBy = req.user.id;
    payroll.processedDate = new Date();

    await payroll.save();

    res.status(200).json({
      success: true,
      message: 'Payroll approved successfully',
      data: payroll
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get my payroll records
// @route   GET /api/payroll/my-payroll
// @access  Private
export const getMyPayroll = async (req, res) => {
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

    const payrolls = await Payroll.find({ 
      employee: employee._id,
      status: { $in: ['approved', 'paid'] }
    })
      .skip(skip)
      .limit(limit)
      .sort({ 'payPeriod.year': -1, 'payPeriod.month': -1 });

    const total = await Payroll.countDocuments({ 
      employee: employee._id,
      status: { $in: ['approved', 'paid'] }
    });

    res.status(200).json({
      success: true,
      count: payrolls.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: payrolls
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Generate payslip
// @route   GET /api/payroll/:id/payslip
// @access  Private
export const generatePayslip = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);

    if (!payroll) {
      return res.status(404).json({
        success: false,
        message: 'Payroll record not found'
      });
    }

    // Check if user can access this payslip
    const employee = await Employee.findOne({ user: req.user.id });
    if (employee && payroll.employee.toString() !== employee._id.toString()) {
      if (!['admin', 'hr'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to access this payslip'
        });
      }
    }

    // Generate payslip data
    const payslipData = {
      payroll,
      generatedDate: new Date(),
      payslipNumber: `PS-${payroll.payPeriod.year}-${payroll.payPeriod.month}-${payroll.employee.employeeId}`
    };

    res.status(200).json({
      success: true,
      data: payslipData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get payroll statistics
// @route   GET /api/payroll/stats/overview
// @access  Private (Admin/HR)
export const getPayrollStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;

    // Current month stats
    const currentMonthStats = await Payroll.aggregate([
      {
        $match: {
          'payPeriod.year': currentYear,
          'payPeriod.month': currentMonth,
          status: { $in: ['approved', 'paid'] }
        }
      },
      {
        $group: {
          _id: null,
          totalEmployees: { $sum: 1 },
          totalGrossPay: { $sum: '$calculations.grossPay' },
          totalNetPay: { $sum: '$calculations.netPay' },
          totalDeductions: { $sum: '$calculations.totalDeductions' },
          averageGrossPay: { $avg: '$calculations.grossPay' },
          averageNetPay: { $avg: '$calculations.netPay' }
        }
      }
    ]);

    // Year-to-date stats
    const ytdStats = await Payroll.aggregate([
      {
        $match: {
          'payPeriod.year': currentYear,
          status: { $in: ['approved', 'paid'] }
        }
      },
      {
        $group: {
          _id: null,
          totalGrossPay: { $sum: '$calculations.grossPay' },
          totalNetPay: { $sum: '$calculations.netPay' },
          totalDeductions: { $sum: '$calculations.totalDeductions' }
        }
      }
    ]);

    // Monthly trends
    const monthlyTrends = await Payroll.aggregate([
      {
        $match: {
          'payPeriod.year': currentYear,
          status: { $in: ['approved', 'paid'] }
        }
      },
      {
        $group: {
          _id: '$payPeriod.month',
          totalGrossPay: { $sum: '$calculations.grossPay' },
          totalNetPay: { $sum: '$calculations.netPay' },
          employeeCount: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        currentMonth: currentMonthStats[0] || {
          totalEmployees: 0,
          totalGrossPay: 0,
          totalNetPay: 0,
          totalDeductions: 0,
          averageGrossPay: 0,
          averageNetPay: 0
        },
        yearToDate: ytdStats[0] || {
          totalGrossPay: 0,
          totalNetPay: 0,
          totalDeductions: 0
        },
        monthlyTrends
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

