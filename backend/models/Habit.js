const mongoose = require('mongoose');

const habitSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  name: {
    type: String,
    required: [true, 'Habit name is required'],
    trim: true,
    maxlength: [100, 'Habit name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  category: {
    type: String,
    enum: ['health', 'fitness', 'learning', 'productivity', 'mindfulness', 'social', 'other', 'general'],
    default: 'general'
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  targetValue: {
    type: Number,
    default: 1,
    min: [1, 'Target value must be at least 1']
  },
  unit: {
    type: String,
    trim: true,
    maxlength: [20, 'Unit cannot exceed 20 characters']
  },
  color: {
    type: String,
    default: '#3B82F6',
    match: [/^#[0-9A-F]{6}$/i, 'Color must be a valid hex color']
  },
  reminder: {
    enabled: {
      type: Boolean,
      default: false
    },
    startTime: {
      type: String,
      default: '09:00',
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format']
    },
    endTime: {
      type: String,
      default: '21:00',
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
    },
    frequency: {
      type: String,
      enum: ['once', 'hourly', 'every-2-hours', 'every-4-hours'],
      default: 'once'
    },
    message: {
      type: String,
      default: 'Time to work on your habit!',
      maxlength: [200, 'Reminder message cannot exceed 200 characters']
    }
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
habitSchema.index({ user: 1, createdAt: -1 });
habitSchema.index({ user: 1, category: 1 });
habitSchema.index({ user: 1, isActive: 1 });

// Virtual for habit duration
habitSchema.virtual('duration').get(function() {
  const now = new Date();
  const start = this.startDate;
  const diffTime = Math.abs(now - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Ensure virtual fields are serialized
habitSchema.set('toJSON', { virtuals: true });
habitSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Habit', habitSchema);
