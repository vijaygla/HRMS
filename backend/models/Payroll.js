import mongoose from 'mongoose';

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  payPeriod: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12
    },
    year: {
      type: Number,
      required: true
    }
  },
  earnings: {
    baseSalary: {
      type: Number,
      required: true,
      min: 0
    },
    overtime: {
      hours: {
        type: Number,
        default: 0,
        min: 0
      },
      rate: {
        type: Number,
        default: 0,
        min: 0
      },
      amount: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    bonuses: {
      performance: {
        type: Number,
        default: 0,
        min: 0
      },
      holiday: {
        type: Number,
        default: 0,
        min: 0
      },
      other: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    allowances: {
      transport: {
        type: Number,
        default: 0,
        min: 0
      },
      meal: {
        type: Number,
        default: 0,
        min: 0
      },
      housing: {
        type: Number,
        default: 0,
        min: 0
      },
      other: {
        type: Number,
        default: 0,
        min: 0
      }
    }
  },
  deductions: {
    tax: {
      federal: {
        type: Number,
        default: 0,
        min: 0
      },
      state: {
        type: Number,
        default: 0,
        min: 0
      },
      local: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    insurance: {
      health: {
        type: Number,
        default: 0,
        min: 0
      },
      dental: {
        type: Number,
        default: 0,
        min: 0
      },
      vision: {
        type: Number,
        default: 0,
        min: 0
      },
      life: {
        type: Number,
        default: 0,
        min: 0
      }
    },
    retirement: {
      type: Number,
      default: 0,
      min: 0
    },
    other: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  attendance: {
    workingDays: {
      type: Number,
      required: true,
      min: 0
    },
    presentDays: {
      type: Number,
      required: true,
      min: 0
    },
    absentDays: {
      type: Number,
      default: 0,
      min: 0
    },
    leaveDays: {
      type: Number,
      default: 0,
      min: 0
    },
    overtimeHours: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  calculations: {
    grossPay: {
      type: Number,
      required: true,
      min: 0
    },
    totalDeductions: {
      type: Number,
      required: true,
      min: 0
    },
    netPay: {
      type: Number,
      required: true,
      min: 0
    }
  },
  status: {
    type: String,
    enum: ['draft', 'calculated', 'approved', 'paid', 'cancelled'],
    default: 'draft'
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  processedDate: {
    type: Date
  },
  paymentDate: {
    type: Date
  },
  paymentMethod: {
    type: String,
    enum: ['bank-transfer', 'check', 'cash', 'digital-wallet'],
    default: 'bank-transfer'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Calculate totals before saving
payrollSchema.pre('save', function(next) {
  // Calculate gross pay
  const totalBonuses = this.earnings.bonuses.performance + 
                      this.earnings.bonuses.holiday + 
                      this.earnings.bonuses.other;
  
  const totalAllowances = this.earnings.allowances.transport + 
                         this.earnings.allowances.meal + 
                         this.earnings.allowances.housing + 
                         this.earnings.allowances.other;
  
  this.calculations.grossPay = this.earnings.baseSalary + 
                              this.earnings.overtime.amount + 
                              totalBonuses + 
                              totalAllowances;
  
  // Calculate total deductions
  const totalTax = this.deductions.tax.federal + 
                  this.deductions.tax.state + 
                  this.deductions.tax.local;
  
  const totalInsurance = this.deductions.insurance.health + 
                        this.deductions.insurance.dental + 
                        this.deductions.insurance.vision + 
                        this.deductions.insurance.life;
  
  this.calculations.totalDeductions = totalTax + 
                                     totalInsurance + 
                                     this.deductions.retirement + 
                                     this.deductions.other;
  
  // Calculate net pay
  this.calculations.netPay = this.calculations.grossPay - this.calculations.totalDeductions;
  
  next();
});

// Ensure unique payroll per employee per period
payrollSchema.index({ 
  employee: 1, 
  'payPeriod.month': 1, 
  'payPeriod.year': 1 
}, { unique: true });

// Populate employee information
payrollSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'employee',
    select: 'personalInfo.firstName personalInfo.lastName employeeId jobInfo.department jobInfo.position',
    populate: {
      path: 'jobInfo.department',
      select: 'name'
    }
  }).populate({
    path: 'processedBy',
    select: 'personalInfo.firstName personalInfo.lastName employeeId'
  });
  next();
});

export default mongoose.model('Payroll', payrollSchema);