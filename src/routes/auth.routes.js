const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const {
  validateRegister,
  validateLogin,
  validateChangePassword,
  validateUpdateProfile,
} = require('../validators/auth.validator');

// Public routes
router.post('/register', validateRegister, authController.registerAdmin);
router.post('/login', validateLogin, authController.loginAdmin);

// Protected routes
router.get('/profile', authMiddleware, authController.getProfile);
router.put('/profile', authMiddleware, validateUpdateProfile, authController.updateProfile);
router.put('/change-password', authMiddleware, validateChangePassword, authController.changePassword);

module.exports = router;
