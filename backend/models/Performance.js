import mongoose from 'mongoose';

const performanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  reviewPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    type: {
      type: String,
      enum: ['quarterly', 'semi-annual', 'annual', 'probation', 'project-based'],
      required: true
    }
  },
  goals: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    targetDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['not-started', 'in-progress', 'completed', 'overdue', 'cancelled'],
      default: 'not-started'
    },
    weight: {
      type: Number,
      min: 0,
      max: 100,
      default: 20
    },
    achievement: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    comments: {
      type: String,
      trim: true
    }
  }],
  competencies: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      enum: ['technical', 'behavioral', 'leadership', 'communication'],
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true
    },
    comments: {
      type: String,
      trim: true
    }
  }],
  overallRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  strengths: [{
    type: String,
    trim: true
  }],
  areasForImprovement: [{
    type: String,
    trim: true
  }],
  developmentPlan: [{
    action: {
      type: String,
      required: true,
      trim: true
    },
    timeline: {
      type: String,
      trim: true
    },
    resources: {
      type: String,
      trim: true
    },
    status: {
      type: String,
      enum: ['planned', 'in-progress', 'completed', 'cancelled'],
      default: 'planned'
    }
  }],
  feedback: {
    employeeSelfAssessment: {
      type: String,
      trim: true
    },
    managerComments: {
      type: String,
      trim: true
    },
    employeeComments: {
      type: String,
      trim: true
    }
  },
  status: {
    type: String,
    enum: ['draft', 'in-review', 'completed', 'acknowledged'],
    default: 'draft'
  },
  submittedDate: {
    type: Date
  },
  acknowledgedDate: {
    type: Date
  },
  nextReviewDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Calculate overall goal achievement
performanceSchema.virtual('goalAchievement').get(function() {
  if (this.goals.length === 0) return 0;
  
  const totalWeight = this.goals.reduce((sum, goal) => sum + goal.weight, 0);
  const weightedAchievement = this.goals.reduce((sum, goal) => {
    return sum + (goal.achievement * goal.weight / 100);
  }, 0);
  
  return totalWeight > 0 ? (weightedAchievement / totalWeight) * 100 : 0;
});

// Calculate average competency rating
performanceSchema.virtual('averageCompetencyRating').get(function() {
  if (this.competencies.length === 0) return 0;
  
  const totalRating = this.competencies.reduce((sum, comp) => sum + comp.rating, 0);
  return totalRating / this.competencies.length;
});

// Ensure unique performance review per employee per period
performanceSchema.index({ 
  employee: 1, 
  'reviewPeriod.startDate': 1, 
  'reviewPeriod.endDate': 1 
}, { unique: true });

// Populate employee and reviewer information
performanceSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'employee',
    select: 'personalInfo.firstName personalInfo.lastName employeeId jobInfo.department jobInfo.position',
    populate: {
      path: 'jobInfo.department',
      select: 'name'
    }
  }).populate({
    path: 'reviewer',
    select: 'personalInfo.firstName personalInfo.lastName employeeId'
  });
  next();
});

export default mongoose.model('Performance', performanceSchema);