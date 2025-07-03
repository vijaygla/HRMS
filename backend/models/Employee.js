import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  personalInfo: {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true
    },
    dateOfBirth: {
      type: Date
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    maritalStatus: {
      type: String,
      enum: ['single', 'married', 'divorced', 'widowed']
    },
    nationality: {
      type: String,
      trim: true
    },
    phone: {
      type: String,
      trim: true
    },
    emergencyContact: {
      name: String,
      relationship: String,
      phone: String
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  jobInfo: {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: true
    },
    position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'intern'],
      default: 'full-time'
    },
    joinDate: {
      type: Date,
      required: [true, 'Join date is required']
    },
    endDate: {
      type: Date
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    },
    workLocation: {
      type: String,
      enum: ['office', 'remote', 'hybrid'],
      default: 'office'
    }
  },
  salary: {
    baseSalary: {
      type: Number,
      required: [true, 'Base salary is required']
    },
    currency: {
      type: String,
      default: 'USD'
    },
    payFrequency: {
      type: String,
      enum: ['monthly', 'bi-weekly', 'weekly'],
      default: 'monthly'
    }
  },
  benefits: {
    healthInsurance: {
      type: Boolean,
      default: false
    },
    dentalInsurance: {
      type: Boolean,
      default: false
    },
    visionInsurance: {
      type: Boolean,
      default: false
    },
    retirement401k: {
      type: Boolean,
      default: false
    }
  },
  documents: [{
    name: String,
    type: String,
    url: String,
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'terminated', 'on-leave'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Generate employee ID
employeeSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    const count = await mongoose.model('Employee').countDocuments();
    this.employeeId = `EMP${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Populate user data
employeeSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'name email avatar role'
  }).populate({
    path: 'jobInfo.department',
    select: 'name code'
  }).populate({
    path: 'jobInfo.manager',
    select: 'personalInfo.firstName personalInfo.lastName employeeId'
  });
  next();
});

export default mongoose.model('Employee', employeeSchema);