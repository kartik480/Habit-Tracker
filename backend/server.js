const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const habitsRoutes = require('./routes/habits');
const progressRoutes = require('./routes/progress');

// Import models
const User = require('./models/User');
const Habit = require('./models/Habit');
const Progress = require('./models/Progress');

const app = express();
const server = http.createServer(app);

// WebSocket setup
const io = socketIo(server, {
  cors: {
    origin: true, // Allow all origins for testing
    methods: ["GET", "POST"]
  }
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('🔌 New client connected:', socket.id);
  
  // Join user to their personal room for real-time updates
  socket.on('joinUser', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined their room: user_${userId}`);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Helper function to emit real-time updates
const emitToUser = (userId, event, data) => {
  console.log(`📡 Emitting ${event} to user ${userId}:`, data);
  io.to(`user_${userId}`).emit(event, data);
  console.log(`📡 Emitted ${event} to user ${userId}`);
};

// Middleware
app.use(cors({
  origin: true, // Allow all origins for testing
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  console.log('🏥 Health check request from:', req.headers.origin || 'Unknown origin');
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.json({ 
    message: 'Habit Tracker API is running!', 
    timestamp: new Date(),
    version: '1.0.0',
    cors: 'enabled',
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: mongoStatus,
      readyState: mongoose.connection.readyState,
      name: mongoose.connection.name || 'Not connected'
    }
  });
});

// Test endpoint for debugging
app.get('/api/test', (req, res) => {
  console.log('🧪 Test endpoint hit from:', req.headers.origin || 'Unknown origin');
  res.json({ 
    message: 'Test endpoint working!',
    headers: {
      origin: req.headers.origin,
      userAgent: req.headers['user-agent'],
      accept: req.headers.accept
    },
    timestamp: new Date()
  });
});

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React build
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
  });
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitsRoutes);
app.use('/api/progress', progressRoutes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found' 
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  // Check if it's a MongoDB connection error
  if (error.name === 'MongoNetworkError' || error.name === 'MongoServerSelectionError') {
    return res.status(503).json({
      message: 'Database connection error - please try again later',
      error: 'Database temporarily unavailable',
      retryAfter: 5
    });
  }
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation failed',
      errors: Object.values(error.errors).map(err => err.message)
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      message: 'Invalid ID format'
    });
  }
  
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return res.status(400).json({
      message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
    });
  }
  
  res.status(500).json({
    message: 'Internal server error'
  });
});

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habit-tracker';
    console.log('🔌 Attempting to connect to MongoDB...');
    console.log('🔌 URI:', mongoURI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('💡 To fix this issue:');
    console.error('   1. Install MongoDB locally: https://docs.mongodb.com/manual/installation/');
    console.error('   2. Or use MongoDB Atlas (cloud): https://www.mongodb.com/cloud/atlas');
    console.error('   3. Or set MONGODB_URI environment variable');
    console.error('🔄 Retrying connection in 5 seconds...');
    
    // Retry connection after 5 seconds
    setTimeout(connectDB, 5000);
  }
};

// Start MongoDB connection
connectDB();

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Habit Tracker API server running on port ${PORT}`);
  console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
  console.log(`🔑 JWT_SECRET: ${process.env.JWT_SECRET ? 'Set ✓' : 'Missing ✗'}`);
  console.log(`🗄️  MongoDB: ${process.env.MONGODB_URI ? 'Set ✓' : 'Missing ✗'}`);
  console.log(`🔌 WebSocket server ready for real-time updates`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💡 Note: Server will start even if MongoDB is not available initially`);
  console.log(`💡 API endpoints will work but database operations will fail until MongoDB connects`);
});

// Export for testing
module.exports = { app, server, io, emitToUser };
