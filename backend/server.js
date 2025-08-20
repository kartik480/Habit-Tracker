const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/habit-tracker')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Routes
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date() });
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const user = new User({
      username,
      email,
      password: hashedPassword
    });
    
    await user.save();
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    
    // Find user by email or username
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }]
    });
    
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    
    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Profile (Protected)
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
    
  } catch (error) {
    console.error('Profile error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Habit Schema
const habitSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  category: { type: String, default: 'General' },
  frequency: { type: String, default: 'daily' },
  target: { type: Number, default: 1 },
  unit: String,
  color: { type: String, default: '#3B82F6' },
  reminder: Boolean,
  startDate: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Habit = mongoose.model('Habit', habitSchema);

// Progress Schema
const progressSchema = new mongoose.Schema({
  habit: { type: mongoose.Schema.Types.ObjectId, ref: 'Habit', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  value: { type: Number, required: true },
  notes: String,
  createdAt: { type: Date, default: Date.now }
});

const Progress = mongoose.model('Progress', progressSchema);

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Habits API
app.get('/api/habits', authenticateToken, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.userId });
    res.json(habits);
  } catch (error) {
    console.error('Get habits error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/habits', authenticateToken, async (req, res) => {
  try {
    const habitData = { ...req.body, user: req.userId };
    const habit = new Habit(habitData);
    await habit.save();
    res.status(201).json({ habit });
  } catch (error) {
    console.error('Create habit error:', error);
    res.status(500).json({ message: 'Failed to create habit' });
  }
});

app.put('/api/habits/:id', authenticateToken, async (req, res) => {
  try {
    const habit = await Habit.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    res.json({ habit });
  } catch (error) {
    console.error('Update habit error:', error);
    res.status(500).json({ message: 'Failed to update habit' });
  }
});

app.delete('/api/habits/:id', authenticateToken, async (req, res) => {
  try {
    const habit = await Habit.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!habit) {
      return res.status(404).json({ message: 'Habit not found' });
    }
    res.json({ message: 'Habit deleted successfully' });
  } catch (error) {
    console.error('Delete habit error:', error);
    res.status(500).json({ message: 'Failed to delete habit' });
  }
});

app.get('/api/habits/stats/overview', authenticateToken, async (req, res) => {
  try {
    const totalHabits = await Habit.countDocuments({ user: req.userId });
    const activeHabits = await Habit.countDocuments({ user: req.userId, isActive: true });
    const completedToday = await Progress.countDocuments({
      user: req.userId,
      date: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999)
      }
    });
    
    res.json({
      totalHabits,
      activeHabits,
      completedToday,
      completionRate: totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ message: 'Failed to get stats' });
  }
});

// Progress API
app.get('/api/progress', authenticateToken, async (req, res) => {
  try {
    const progress = await Progress.find({ user: req.userId }).populate('habit');
    res.json(progress);
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/progress', authenticateToken, async (req, res) => {
  try {
    const { habit, date, value, notes } = req.body;
    
    // Validate required fields
    if (!habit || !date || value === undefined) {
      return res.status(400).json({ 
        message: 'Missing required fields: habit, date, and value are required' 
      });
    }
    
    // Convert date string to Date object if needed
    let progressDate;
    try {
      progressDate = new Date(date);
      if (isNaN(progressDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    // Check if progress already exists for this habit and date
    const existingProgress = await Progress.findOne({
      user: req.userId,
      habit: habit,
      date: {
        $gte: new Date(progressDate.getFullYear(), progressDate.getMonth(), progressDate.getDate()),
        $lt: new Date(progressDate.getFullYear(), progressDate.getMonth(), progressDate.getDate() + 1)
      }
    });
    
    if (existingProgress) {
      return res.status(400).json({ 
        message: 'Progress already exists for this habit and date' 
      });
    }
    
    const progressData = { 
      user: req.userId,
      habit: habit,
      date: progressDate,
      value: Number(value),
      notes: notes || '',
    };
    
    const progress = new Progress(progressData);
    await progress.save();
    
    // Populate the habit reference for the response
    await progress.populate('habit');
    
    res.status(201).json({ progress });
  } catch (error) {
    console.error('Create progress error:', error);
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Progress already exists for this habit and date' 
      });
    }
    
    res.status(500).json({ message: 'Failed to create progress' });
  }
});

app.put('/api/progress/:id', authenticateToken, async (req, res) => {
  try {
    const { habit, date, value, notes } = req.body;
    
    // Validate required fields
    if (!habit || !date || value === undefined) {
      return res.status(400).json({ 
        message: 'Missing required fields: habit, date, and value are required' 
      });
    }
    
    // Convert date string to Date object if needed
    let progressDate;
    try {
      progressDate = new Date(date);
      if (isNaN(progressDate.getTime())) {
        return res.status(400).json({ message: 'Invalid date format' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Invalid date format' });
    }
    
    // Check if progress already exists for this habit and date (excluding current entry)
    const existingProgress = await Progress.findOne({
      _id: { $ne: req.params.id },
      user: req.userId,
      habit: habit,
      date: {
        $gte: new Date(progressDate.getFullYear(), progressDate.getMonth(), progressDate.getDate()),
        $lt: new Date(progressDate.getFullYear(), progressDate.getMonth(), progressDate.getDate() + 1)
      }
    });
    
    if (existingProgress) {
      return res.status(400).json({ 
        message: 'Progress already exists for this habit and date' 
      });
    }
    
    const updateData = { 
      habit: habit,
      date: progressDate,
      value: Number(value),
      notes: notes || '',
    };
    
    const progress = await Progress.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }
    
    // Populate the habit reference for the response
    await progress.populate('habit');
    
    res.json({ progress });
  } catch (error) {
    console.error('Update progress error:', error);
    
    // Handle specific validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }
    
    // Handle duplicate key errors
    if (error.code === 11000) {
      return res.status(400).json({ 
        message: 'Progress already exists for this habit and date' 
      });
    }
    
    res.status(500).json({ message: 'Failed to update progress' });
  }
});

app.delete('/api/progress/:id', authenticateToken, async (req, res) => {
  try {
    const progress = await Progress.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!progress) {
      return res.status(404).json({ message: 'Progress not found' });
    }
    res.json({ message: 'Progress deleted successfully' });
  } catch (error) {
    console.error('Delete progress error:', error);
    res.status(500).json({ message: 'Failed to delete progress' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`🔑 JWT_SECRET: ${process.env.JWT_SECRET ? 'Set ✓' : 'Missing ✗'}`);
  console.log(`🗄️  MongoDB: ${process.env.MONGODB_URI ? 'Set ✓' : 'Missing ✗'}`);
});
