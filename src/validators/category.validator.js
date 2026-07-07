const { body, param } = require('express-validator');
const { handleValidationErrors } = require('./index');

const validateCreateCategory = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Category name is required')
    .isLength({ max: 255 })
    .withMessage('Category name must not exceed 255 characters'),
  body('name_ar')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Arabic category name must not exceed 255 characters'),
  handleValidationErrors,
];

const validateUpdateCategory = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Category name must be between 1 and 255 characters'),
  body('name_ar')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Arabic category name must not exceed 255 characters'),
  handleValidationErrors,
];

const validateCategoryId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  handleValidationErrors,
];

const validateAssignCities = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  body('city_ids')
    .isArray({ min: 1 })
    .withMessage('city_ids must be a non-empty array'),
  body('city_ids.*')
    .isInt({ min: 1 })
    .withMessage('Each city_id must be a positive integer'),
  handleValidationErrors,
];

module.exports = {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId,
  validateAssignCities,
};
