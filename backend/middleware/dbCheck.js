const mongoose = require('mongoose');

const dbCheck = (req, res, next) => {
  // Check if MongoDB is connected
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: 'Database is not available. Please try again in a few moments.',
      error: 'Database connection required',
      retryAfter: 5
    });
  }
  
  next();
};

module.exports = dbCheck;
