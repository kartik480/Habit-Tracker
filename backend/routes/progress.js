const express = require('express');
const { body, validationResult } = require('express-validator');
const Progress = require('../models/Progress');
const Habit = require('../models/Habit');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get all progress for the authenticated user
router.get('/', async (req, res) => {
  try {
    const { habitId, date, startDate, endDate } = req.query;
    
    const filter = { user: req.userId };
    
    if (habitId) filter.habitId = habitId;
    if (date) filter.date = date;
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }
    
    const progress = await Progress.find(filter)
      .populate('habitId', 'name category color targetValue unit')
      .sort({ date: -1 });

    res.json(progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch progress' 
    });
  }
});

// Get progress for a specific date
router.get('/date/:date', async (req, res) => {
  try {
    const { date } = req.params;
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ 
        message: 'Invalid date format. Use YYYY-MM-DD' 
      });
    }
    
    const progress = await Progress.find({ 
      user: req.userId, 
      date: date 
    }).populate('habitId', 'name category color targetValue unit');

    res.json(progress);
  } catch (error) {
    console.error('Get progress by date error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch progress for date' 
    });
  }
});

// Get progress for a specific habit
router.get('/habit/:habitId', async (req, res) => {
  try {
    const { habitId } = req.params;
    const { startDate, endDate, limit = 30 } = req.query;
    
    const filter = { 
      user: req.userId, 
      habitId: habitId 
    };
    
    if (startDate && endDate) {
      filter.date = { $gte: startDate, $lte: endDate };
    }
    
    const progress = await Progress.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .populate('habitId', 'name category color targetValue unit');

    res.json(progress);
  } catch (error) {
    console.error('Get progress by habit error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        message: 'Invalid habit ID' 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to fetch progress for habit' 
    });
  }
});

// Create or update progress
router.post('/', [
  body('habitId')
    .notEmpty()
    .withMessage('Habit ID is required')
    .isMongoId()
    .withMessage('Invalid habit ID'),
  
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  
  body('value')
    .isFloat({ min: 0 })
    .withMessage('Value must be a non-negative number'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { habitId, date, value, notes } = req.body;
    
    // Validate that date is not in the future
    const today = new Date().toISOString().split('T')[0];
    if (date > today) {
      return res.status(400).json({
        message: 'Cannot create progress for future dates'
      });
    }
    
    // Check if habit exists and belongs to user
    const habit = await Habit.findOne({ 
      _id: habitId, 
      user: req.userId 
    });
    
    if (!habit) {
      return res.status(404).json({ 
        message: 'Habit not found' 
      });
    }
    
    // Check if progress already exists for this habit and date
    let progress = await Progress.findOne({
      user: req.userId,
      habitId: habitId,
      date: date
    });
    
    if (progress) {
      // Update existing progress
      progress.value = Number(value);
      progress.notes = notes || '';
      progress.completed = Number(value) >= habit.targetValue;
      progress.completedAt = Number(value) >= habit.targetValue ? new Date() : null;
      
      await progress.save();
      
      res.json({
        message: 'Progress updated successfully',
        progress: await progress.populate('habitId', 'name category color targetValue unit')
      });
    } else {
      // Create new progress
      const progressData = {
        user: req.userId,
        habitId: habitId,
        date: date,
        value: Number(value),
        notes: notes || '',
        completed: Number(value) >= habit.targetValue,
        completedAt: Number(value) >= habit.targetValue ? new Date() : null
      };
      
      progress = new Progress(progressData);
      await progress.save();
      
      res.status(201).json({
        message: 'Progress created successfully',
        progress: await progress.populate('habitId', 'name category color targetValue unit')
      });
    }
  } catch (error) {
    console.error('Create/update progress error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to save progress' 
    });
  }
});

// Update progress by ID
router.put('/:id', [
  body('habitId')
    .notEmpty()
    .withMessage('Habit ID is required')
    .isMongoId()
    .withMessage('Invalid habit ID'),
  
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Date must be in YYYY-MM-DD format'),
  
  body('value')
    .isFloat({ min: 0 })
    .withMessage('Value must be a non-negative number'),
  
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { habitId, date, value, notes } = req.body;
    
    // Validate that date is not in the future
    const today = new Date().toISOString().split('T')[0];
    if (date > today) {
      return res.status(400).json({
        message: 'Cannot create progress for future dates'
      });
    }
    
    // Check if habit exists and belongs to user
    const habit = await Habit.findOne({ 
      _id: habitId, 
      user: req.userId 
    });
    
    if (!habit) {
      return res.status(404).json({ 
        message: 'Habit not found' 
      });
    }
    
    // Check if progress already exists for this habit and date (excluding current entry)
    const existingProgress = await Progress.findOne({
      _id: { $ne: req.params.id },
      user: req.userId,
      habitId: habitId,
      date: date
    });
    
    if (existingProgress) {
      return res.status(400).json({ 
        message: 'Progress already exists for this habit and date' 
      });
    }
    
    // Update progress
    const progress = await Progress.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      {
        habitId: habitId,
        date: date,
        value: Number(value),
        notes: notes || '',
        completed: Number(value) >= habit.targetValue,
        completedAt: Number(value) >= habit.targetValue ? new Date() : null
      },
      { new: true, runValidators: true }
    );
    
    if (!progress) {
      return res.status(404).json({ 
        message: 'Progress not found' 
      });
    }
    
    res.json({
      message: 'Progress updated successfully',
      progress: await progress.populate('habitId', 'name category color targetValue unit')
    });
  } catch (error) {
    console.error('Update progress error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        message: 'Invalid progress ID' 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to update progress' 
    });
  }
});

// Delete progress by ID
router.delete('/:id', async (req, res) => {
  try {
    const progress = await Progress.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!progress) {
      return res.status(404).json({ 
        message: 'Progress not found' 
      });
    }

    res.json({ 
      message: 'Progress deleted successfully' 
    });
  } catch (error) {
    console.error('Delete progress error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        message: 'Invalid progress ID' 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to delete progress' 
    });
  }
});

// Toggle completion status
router.patch('/:id/toggle-completion', async (req, res) => {
  try {
    const progress = await Progress.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!progress) {
      return res.status(404).json({ 
        message: 'Progress not found' 
      });
    }

    // Toggle completion status
    progress.completed = !progress.completed;
    progress.completedAt = progress.completed ? new Date() : null;
    
    await progress.save();

    res.json({
      message: `Progress ${progress.completed ? 'marked as completed' : 'marked as incomplete'}`,
      progress: await progress.populate('habitId', 'name category color targetValue unit')
    });
  } catch (error) {
    console.error('Toggle completion error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        message: 'Invalid progress ID' 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to toggle completion status' 
    });
  }
});

// Get progress statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const lastMonth = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const [todayProgress, weekProgress, monthProgress, totalProgress] = await Promise.all([
      Progress.countDocuments({ user: req.userId, date: today, completed: true }),
      Progress.countDocuments({ user: req.userId, date: { $gte: lastWeek }, completed: true }),
      Progress.countDocuments({ user: req.userId, date: { $gte: lastMonth }, completed: true }),
      Progress.countDocuments({ user: req.userId, completed: true })
    ]);
    
    const totalHabits = await Habit.countDocuments({ user: req.userId, isActive: true });
    
    res.json({
      todayCompleted: todayProgress,
      weekCompleted: weekProgress,
      monthCompleted: monthProgress,
      totalCompleted: totalProgress,
      totalHabits,
      todayCompletionRate: totalHabits > 0 ? Math.round((todayProgress / totalHabits) * 100) : 0,
      weekCompletionRate: totalHabits > 0 ? Math.round((weekProgress / (totalHabits * 7)) * 100) : 0,
      monthCompletionRate: totalHabits > 0 ? Math.round((monthProgress / (totalHabits * 30)) * 100) : 0
    });
  } catch (error) {
    console.error('Get progress stats error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch progress statistics' 
    });
  }
});

module.exports = router;
