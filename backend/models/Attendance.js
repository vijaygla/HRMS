import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  checkIn: {
    time: {
      type: Date
    },
    location: {
      type: String,
      enum: ['office', 'remote', 'field'],
      default: 'office'
    },
    ipAddress: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  checkOut: {
    time: {
      type: Date
    },
    location: {
      type: String,
      enum: ['office', 'remote', 'field'],
      default: 'office'
    },
    ipAddress: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  breaks: [{
    startTime: Date,
    endTime: Date,
    reason: String
  }],
  workingHours: {
    type: Number,
    default: 0
  },
  overtimeHours: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day', 'on-leave'],
    default: 'present'
  },
  notes: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  isManualEntry: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Calculate working hours
attendanceSchema.methods.calculateWorkingHours = function() {
  if (this.checkIn.time && this.checkOut.time) {
    const workingMs = this.checkOut.time - this.checkIn.time;
    
    // Subtract break time
    let breakMs = 0;
    this.breaks.forEach(breakItem => {
      if (breakItem.startTime && breakItem.endTime) {
        breakMs += breakItem.endTime - breakItem.startTime;
      }
    });
    
    const totalWorkingMs = workingMs - breakMs;
    this.workingHours = Math.max(0, totalWorkingMs / (1000 * 60 * 60)); // Convert to hours
    
    // Calculate overtime (assuming 8 hours is standard)
    this.overtimeHours = Math.max(0, this.workingHours - 8);
  }
  return this.workingHours;
};

// Ensure unique attendance per employee per day
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

// Populate employee information
attendanceSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'employee',
    select: 'personalInfo.firstName personalInfo.lastName employeeId jobInfo.department',
    populate: {
      path: 'jobInfo.department',
      select: 'name'
    }
  });
  next();
});

export default mongoose.model('Attendance', attendanceSchema);

