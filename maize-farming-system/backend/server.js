const path = require('path');
const express = require('express');
require('dotenv').config();

const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static frontend files (we will build these next)
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth',      require('./routes/authRoutes')); 
app.use('/api/farmers',   require('./routes/farmerRoutes'));
app.use('/api/farms',     require('./routes/farmRoutes'));
app.use('/api/diseases',  require('./routes/diseaseRoutes'));
app.use('/api/harvests',  require('./routes/harvestRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Central Error Handler
app.use((err, req, res, next) => {
  console.error('🔥 Error stack:', err && err.stack ? err.stack : err);
  console.error('🔥 Error message:', err && err.message ? err.message : err);
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: `Duplicate value for ${Object.keys(err.keyPattern || {}).join(', ')}`
    });
  }
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: Object.values(err.errors).map(e => e.message).join('; ')
    });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: `Invalid value for ${err.path}`
    });
  }
  res.status(err.status || 500).json({ success: false, message: err.message || 'Server error' });
});

// Connect to Database and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🌽 Server running at http://localhost:${PORT}`);
  });
});