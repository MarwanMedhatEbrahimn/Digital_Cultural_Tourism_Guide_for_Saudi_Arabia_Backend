const express = require('express');
const router = express.Router();

// Import all route modules
const authRoutes = require('./auth.routes');
const touristAuthRoutes = require('./tourist.auth.routes');
const touristFeatureRoutes = require('./tourist.feature.routes');
const cityRoutes = require('./city.routes');
const categoryRoutes = require('./category.routes');
const placeRoutes = require('./place.routes');
const questionRoutes = require('./question.routes');
const suggestedDestinationRoutes = require('./suggestedDestination.routes');
const dashboardRoutes = require('./dashboard.routes');

// Mount routes
router.use('/auth', authRoutes);
router.use('/tourist/auth', touristAuthRoutes);
router.use('/tourist/features', touristFeatureRoutes);
router.use('/cities', cityRoutes);
router.use('/categories', categoryRoutes);
router.use('/places', placeRoutes);
router.use('/questions', questionRoutes);
router.use('/suggested-destinations', suggestedDestinationRoutes);
router.use('/dashboard', dashboardRoutes);

// Health check route
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
