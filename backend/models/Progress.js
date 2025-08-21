const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  habitId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Habit',
    required: [true, 'Habit ID is required']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
    match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format']
  },
  value: {
    type: Number,
    default: 0,
    min: [0, 'Value cannot be negative']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Compound index to ensure unique progress per habit per date per user
progressSchema.index({ user: 1, habitId: 1, date: 1 }, { unique: true });

// Index for better query performance
progressSchema.index({ user: 1, date: -1 });
progressSchema.index({ user: 1, habitId: 1 });
progressSchema.index({ user: 1, completed: 1 });

// Pre-save middleware to validate date is not in the future
progressSchema.pre('save', function(next) {
  const today = new Date().toISOString().split('T')[0];
  if (this.date > today) {
    const error = new Error('Cannot create progress for future dates');
    error.name = 'ValidationError';
    return next(error);
  }
  next();
});

// Method to check if progress meets habit target
progressSchema.methods.meetsTarget = function(habitTarget) {
  return this.value >= habitTarget;
};

// Method to get progress status
progressSchema.methods.getStatus = function(habitTarget) {
  if (this.value >= habitTarget) {
    return 'completed';
  } else if (this.value > 0) {
    return 'partial';
  } else {
    return 'not-started';
  }
};

module.exports = mongoose.model('Progress', progressSchema);
