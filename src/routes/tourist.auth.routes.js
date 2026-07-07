const express = require('express');
const router = express.Router();
const touristAuthController = require('../controllers/tourist.auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const {
  validateTouristRegister,
  validateTouristLogin,
  validateUpdateTouristProfile,
} = require('../validators/tourist.validator');

// Public routes
router.post('/register', validateTouristRegister, touristAuthController.registerTourist);
router.post('/login', validateTouristLogin, touristAuthController.loginTourist);

// Protected routes
router.get('/profile', authMiddleware, touristAuthController.getProfile);
router.put('/profile', authMiddleware, validateUpdateTouristProfile, touristAuthController.updateProfile);

module.exports = router;
