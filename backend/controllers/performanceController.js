import Performance from '../models/Performance.js';
import Employee from '../models/Employee.js';

// @desc    Get all performance reviews
// @route   GET /api/performance
// @access  Private (Admin/HR/Manager)
export const getPerformanceReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (req.query.employee) {
      query.employee = req.query.employee;
    }
    
    if (req.query.reviewer) {
      query.reviewer = req.query.reviewer;
    }
    
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    if (req.query.type) {
      query['reviewPeriod.type'] = req.query.type;
    }

    const reviews = await Performance.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Performance.countDocuments(query);

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single performance review
// @route   GET /api/performance/:id
// @access  Private
export const getPerformanceReview = async (req, res) => {
  try {
    const review = await Performance.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Performance review not found'
      });
    }

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create performance review
// @route   POST /api/performance
// @access  Private (Admin/HR/Manager)
export const createPerformanceReview = async (req, res) => {
  try {
    // Get reviewer employee profile
    const reviewer = await Employee.findOne({ user: req.user.id });
    if (!reviewer) {
      return res.status(404).json({
        success: false,
        message: 'Reviewer profile not found'
      });
    }

    const review = await Performance.create({
      ...req.body,
      reviewer: reviewer._id
    });

    res.status(201).json({
      success: true,
      message: 'Performance review created successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update performance review
// @route   PUT /api/performance/:id
// @access  Private
export const updatePerformanceReview = async (req, res) => {
  try {
    const review = await Performance.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Performance review not found'
      });
    }

    // Check if user can update this review
    const employee = await Employee.findOne({ user: req.user.id });
    const canUpdate = 
      (employee && review.reviewer.toString() === employee._id.toString()) ||
      (employee && review.employee.toString() === employee._id.toString()) ||
      ['admin', 'hr'].includes(req.user.role);

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this performance review'
      });
    }

    const updatedReview = await Performance.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: 'Performance review updated successfully',
      data: updatedReview
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete performance review
// @route   DELETE /api/performance/:id
// @access  Private (Admin/HR)
export const deletePerformanceReview = async (req, res) => {
  try {
    const review = await Performance.findByIdAndDelete(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Performance review not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Performance review deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Submit performance review
// @route   PUT /api/performance/:id/submit
// @access  Private (Admin/HR/Manager)
export const submitReview = async (req, res) => {
  try {
    const review = await Performance.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Performance review not found'
      });
    }

    if (review.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Review is not in draft status'
      });
    }

    review.status = 'in-review';
    review.submittedDate = new Date();

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Performance review submitted successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Acknowledge performance review
// @route   PUT /api/performance/:id/acknowledge
// @access  Private
export const acknowledgeReview = async (req, res) => {
  try {
    const review = await Performance.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Performance review not found'
      });
    }

    // Check if user is the employee being reviewed
    const employee = await Employee.findOne({ user: req.user.id });
    if (!employee || review.employee.toString() !== employee._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to acknowledge this review'
      });
    }

    if (review.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Review must be completed before acknowledgment'
      });
    }

    review.status = 'acknowledged';
    review.acknowledgedDate = new Date();

    // Add employee comments if provided
    if (req.body.employeeComments) {
      review.feedback.employeeComments = req.body.employeeComments;
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: 'Performance review acknowledged successfully',
      data: review
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get my performance reviews
// @route   GET /api/performance/my-reviews
// @access  Private
export const getMyPerformanceReviews = async (req, res) => {
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

    const reviews = await Performance.find({ employee: employee._id })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Performance.countDocuments({ employee: employee._id });

    res.status(200).json({
      success: true,
      count: reviews.length,
      total,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit)
      },
      data: reviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get performance statistics
// @route   GET /api/performance/stats/overview
// @access  Private (Admin/HR)
export const getPerformanceStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // Reviews by status
    const statusStats = await Performance.aggregate([
      {
        $match: {
          createdAt: {
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

    // Reviews by type
    const typeStats = await Performance.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: '$reviewPeriod.type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Average ratings
    const ratingStats = await Performance.aggregate([
      {
        $match: {
          status: { $in: ['completed', 'acknowledged'] },
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$overallRating' },
          totalReviews: { $sum: 1 },
          highPerformers: {
            $sum: {
              $cond: [{ $gte: ['$overallRating', 4.5] }, 1, 0]
            }
          },
          lowPerformers: {
            $sum: {
              $cond: [{ $lt: ['$overallRating', 3.0] }, 1, 0]
            }
          }
        }
      }
    ]);

    // Monthly review trends
    const monthlyStats = await Performance.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
          averageRating: { $avg: '$overallRating' }
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
        ratings: ratingStats[0] || {
          averageRating: 0,
          totalReviews: 0,
          highPerformers: 0,
          lowPerformers: 0
        },
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

