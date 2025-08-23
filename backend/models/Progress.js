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

// Database migration function to fix old indexes
progressSchema.statics.migrateDatabase = async function() {
  try {
    console.log('🔧 Starting database migration...');
    const collection = this.collection;
    
    // Get all indexes
    const indexes = await collection.indexes();
    console.log('📊 Current indexes:', indexes.map(idx => idx.name));
    
    // Check if old index exists
    const oldIndex = indexes.find(idx => idx.name === 'user_1_habit_1_date_1');
    if (oldIndex) {
      console.log('❌ Found old index, dropping it...');
      await collection.dropIndex('user_1_habit_1_date_1');
      console.log('✅ Old index dropped');
    }
    
    // Check if new index exists
    const newIndex = indexes.find(idx => idx.name === 'user_1_habitId_1_date_1');
    if (!newIndex) {
      console.log('🔧 Creating new index...');
      await collection.createIndex({ user: 1, habitId: 1, date: 1 }, { unique: true });
      console.log('✅ New index created');
    }
    
    // Clean up corrupted records
    console.log('🧹 Cleaning up corrupted records...');
    const deleteResult = await collection.deleteMany({
      $or: [
        { habitId: null },
        { habit: { $exists: true } }
      ]
    });
    console.log(`✅ Deleted ${deleteResult.deletedCount} corrupted records`);
    
    console.log('🎉 Database migration completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Database migration failed:', error);
    return false;
  }
};

// Pre-save middleware to validate date is not in the future
progressSchema.pre('save', function(next) {
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-CA'); // YYYY-MM-DD format
  console.log('🔍 Progress model pre-save validation - Date:', this.date, 'Today:', todayStr, 'Is future:', this.date > todayStr);
  
  if (this.date > todayStr) {
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
