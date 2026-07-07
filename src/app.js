require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// Global Middleware
app.use(cors({
  origin: '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images as static assets
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Tourism Management API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
      cities: '/api/cities',
      categories: '/api/categories',
      places: '/api/places',
      questions: '/api/questions',
      suggestedDestinations: '/api/suggested-destinations',
      dashboard: '/api/dashboard',
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Error handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════╗
║                                                       ║
║   🌍 Tourism Management API Server                   ║
║                                                       ║
║   Server running on: http://localhost:${PORT}        ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(27)}║
║                                                       ║
║   API Documentation: http://localhost:${PORT}/api     ║
║                                                       ║
╚═══════════════════════════════════════════════════════╝
  `);
});

module.exports = app;
