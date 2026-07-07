const { body } = require('express-validator');
const { handleValidationErrors } = require('./index');

const validateTouristRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 255 })
    .withMessage('Name must not exceed 255 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors,
];

const validateTouristLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

const validateUpdateTouristProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  handleValidationErrors,
];

const validateToggleLike = [
  body('place_id')
    .notEmpty()
    .withMessage('Place ID is required')
    .isInt({ min: 1 })
    .withMessage('Place ID must be a positive integer'),
  handleValidationErrors,
];

const validateAddActivity = [
  body('day_number')
    .notEmpty()
    .withMessage('Day number is required')
    .isInt({ min: 1 })
    .withMessage('Day number must be a positive integer'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  handleValidationErrors,
];

const validateSubmitQuiz = [
  body('option_ids')
    .isArray({ min: 1 })
    .withMessage('option_ids must be a non-empty array'),
  body('option_ids.*')
    .isInt({ min: 1 })
    .withMessage('Each option_id must be a positive integer'),
  handleValidationErrors,
];

module.exports = {
  validateTouristRegister,
  validateTouristLogin,
  validateUpdateTouristProfile,
  validateToggleLike,
  validateAddActivity,
  validateSubmitQuiz,
};
