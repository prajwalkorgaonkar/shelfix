const express = require('express');
const mongoose = require('mongoose');
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

// Routes
app.use('/api/auth', require('../server/routes/authRoutes'));
app.use('/api/books', require('../server/routes/bookRoutes'));
app.use('/api/users', require('../server/routes/userRoutes'));
app.use('/api/borrow', require('../server/routes/borrowRoutes'));

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Connect to MongoDB only if provided
if (process.env.MONGO_URI && mongoose.connection.readyState === 0) {
  mongoose
    .connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => {
      console.log('Connected to MongoDB');
    })
    .catch((err) => {
      console.log('MongoDB not available, using in-memory storage:', err.message);
    });
} else {
  console.log('Using in-memory storage (MONGO_URI not provided)');
}

module.exports = app;
