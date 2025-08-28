const express = require('express');
const { body, validationResult } = require('express-validator');
const Habit = require('../models/Habit');
const { authenticateToken } = require('../middleware/auth');
const dbCheck = require('../middleware/dbCheck');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Apply database check middleware to all routes
router.use(dbCheck);

// Get all habits for the authenticated user
router.get('/', async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.userId })
      .sort({ createdAt: -1 });

    res.json(habits);
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch habits' 
    });
  }
});

// Get a single habit by ID
router.get('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!habit) {
      return res.status(404).json({ 
        message: 'Habit not found' 
      });
    }

    res.json(habit);
  } catch (error) {
    console.error('Get habit error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        message: 'Invalid habit ID' 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to fetch habit' 
    });
  }
});

// Create a new habit
router.post('/', [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Habit name is required')
    .isLength({ max: 100 })
    .withMessage('Habit name cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('category')
    .optional()
    .isIn(['health', 'fitness', 'learning', 'productivity', 'mindfulness', 'social', 'other', 'general'])
    .withMessage('Invalid category'),
  
  body('frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Invalid frequency'),
  
  body('targetValue')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Target value must be a positive integer'),
  
  body('unit')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Unit cannot exceed 20 characters'),
  
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color'),
  
  body('reminder.enabled')
    .optional()
    .isBoolean()
    .withMessage('Reminder enabled must be a boolean'),
  
  body('reminder.startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  
  body('reminder.endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  
  body('reminder.frequency')
    .optional()
    .isIn(['once', 'hourly', 'every-2-hours', 'every-4-hours'])
    .withMessage('Invalid reminder frequency'),
  
  body('reminder.message')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Reminder message cannot exceed 200 characters')
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

    const habitData = { ...req.body, user: req.userId };
    console.log('🔍 Creating habit with data:', habitData);
    const habit = new Habit(habitData);
    await habit.save();
    console.log('✅ Habit created successfully:', habit);

    res.status(201).json({
      message: 'Habit created successfully',
      habit
    });
  } catch (error) {
    console.error('Create habit error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to create habit' 
    });
  }
});

// Update a habit
router.put('/:id', [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Habit name cannot exceed 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  
  body('category')
    .optional()
    .isIn(['health', 'fitness', 'learning', 'productivity', 'mindfulness', 'social', 'other', 'general'])
    .withMessage('Invalid category'),
  
  body('frequency')
    .optional()
    .isIn(['daily', 'weekly', 'monthly'])
    .withMessage('Invalid frequency'),
  
  body('targetValue')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Target value must be a positive integer'),
  
  body('unit')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Unit cannot exceed 20 characters'),
  
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color'),
  
  body('reminder.enabled')
    .optional()
    .isBoolean()
    .withMessage('Reminder enabled must be a boolean'),
  
  body('reminder.startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  
  body('reminder.endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  
  body('reminder.frequency')
    .optional()
    .isIn(['once', 'hourly', 'every-2-hours', 'every-4-hours'])
    .withMessage('Invalid reminder frequency'),
  
  body('reminder.message')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Reminder message cannot exceed 200 characters')
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

    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!habit) {
      return res.status(404).json({ 
        message: 'Habit not found' 
      });
    }

    res.json({
      message: 'Habit updated successfully',
      habit
    });
  } catch (error) {
    console.error('Update habit error:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        message: 'Invalid habit ID' 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to update habit' 
    });
  }
});

// Delete a habit
router.delete('/:id', async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!habit) {
      return res.status(404).json({ 
        message: 'Habit not found' 
      });
    }

    res.json({ 
      message: 'Habit deleted successfully' 
    });
  } catch (error) {
    console.error('Delete habit error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        message: 'Invalid habit ID' 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to delete habit' 
    });
  }
});

// Toggle habit active status
router.patch('/:id/toggle-status', async (req, res) => {
  try {
    const habit = await Habit.findOne({ 
      _id: req.params.id, 
      user: req.userId 
    });

    if (!habit) {
      return res.status(404).json({ 
        message: 'Habit not found' 
      });
    }

    habit.isActive = !habit.isActive;
    await habit.save();

    res.json({
      message: `Habit ${habit.isActive ? 'activated' : 'deactivated'} successfully`,
      habit
    });
  } catch (error) {
    console.error('Toggle habit status error:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(400).json({ 
        message: 'Invalid habit ID' 
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to toggle habit status' 
    });
  }
});

// Get habit statistics
router.get('/stats/overview', async (req, res) => {
  try {
    const totalHabits = await Habit.countDocuments({ user: req.userId });
    const activeHabits = await Habit.countDocuments({ 
      user: req.userId, 
      isActive: true 
    });
    
    const categoryStats = await Habit.aggregate([
      { $match: { user: req.userId } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalHabits,
      activeHabits,
      inactiveHabits: totalHabits - activeHabits,
      categoryStats
    });
  } catch (error) {
    console.error('Get habit stats error:', error);
    res.status(500).json({ 
      message: 'Failed to fetch habit statistics' 
    });
  }
});

module.exports = router;
