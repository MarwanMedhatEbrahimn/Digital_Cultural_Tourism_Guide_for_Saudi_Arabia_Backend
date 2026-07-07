const { body, param } = require('express-validator');
const { handleValidationErrors } = require('./index');

const validateTouristUserId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  handleValidationErrors,
];

const validateAdminUpdateUser = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
  body('name')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  body('email')
    .optional({ checkFalsy: true })
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  body('password')
    .optional({ checkFalsy: true })
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors,
];

module.exports = {
  validateTouristUserId,
  validateAdminUpdateUser,
};
