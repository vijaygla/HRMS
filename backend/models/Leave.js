import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  leaveType: {
    type: String,
    required: [true, 'Leave type is required'],
    enum: ['annual', 'sick', 'personal', 'maternity', 'paternity', 'emergency', 'unpaid']
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  totalDays: {
    type: Number,
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true,
    maxlength: [500, 'Reason cannot be more than 500 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  approvedDate: {
    type: Date
  },
  rejectionReason: {
    type: String,
    trim: true
  },
  documents: [{
    name: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  isHalfDay: {
    type: Boolean,
    default: false
  },
  halfDayPeriod: {
    type: String,
    enum: ['morning', 'afternoon'],
    required: function() {
      return this.isHalfDay;
    }
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  }
}, {
  timestamps: true
});

// Calculate total days
leaveSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const timeDiff = this.endDate.getTime() - this.startDate.getTime();
    this.totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    
    if (this.isHalfDay && this.totalDays === 1) {
      this.totalDays = 0.5;
    }
  }
  next();
});

// Validate date range
leaveSchema.pre('save', function(next) {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

// Populate employee and approver information
leaveSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'employee',
    select: 'personalInfo.firstName personalInfo.lastName employeeId jobInfo.department',
    populate: {
      path: 'jobInfo.department',
      select: 'name'
    }
  }).populate({
    path: 'approvedBy',
    select: 'personalInfo.firstName personalInfo.lastName employeeId'
  });
  next();
});

export default mongoose.model('Leave', leaveSchema);