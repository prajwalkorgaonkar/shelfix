const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (for debugging)
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
try {
  app.use('/api/auth', require('../server/routes/authRoutes'));
  app.use('/api/books', require('../server/routes/bookRoutes'));
  app.use('/api/users', require('../server/routes/userRoutes'));
  app.use('/api/borrow', require('../server/routes/borrowRoutes'));
} catch (err) {
  console.error('Error loading routes:', err.message);
}

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date(), uptime: process.uptime() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Shelfix API Server Running', version: '1.0.0' });
});

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({ message: 'API endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  res.status(err.status || 500).json({ 
    message: err.message || 'Something went wrong!', 
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});

// Export app for Vercel serverless function
module.exports = app;
