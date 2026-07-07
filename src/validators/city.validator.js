const { body, param } = require('express-validator');
const { handleValidationErrors } = require('./index');

const validateCreateCity = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('City name is required')
    .isLength({ max: 255 })
    .withMessage('City name must not exceed 255 characters'),
  body('name_ar')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Arabic city name must not exceed 255 characters'),
  body('description')
    .optional()
    .trim(),
  body('description_ar')
    .optional()
    .trim(),
  handleValidationErrors,
];

const validateUpdateCity = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('City ID must be a positive integer'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('City name must be between 1 and 255 characters'),
  body('name_ar')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Arabic city name must not exceed 255 characters'),
  body('description')
    .optional()
    .trim(),
  body('description_ar')
    .optional()
    .trim(),
  handleValidationErrors,
];

const validateCityId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('City ID must be a positive integer'),
  handleValidationErrors,
];

const validateAddCategoryToCity = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('City ID must be a positive integer'),
  body('cate_id')
    .notEmpty()
    .withMessage('Category ID is required')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  handleValidationErrors,
];

module.exports = {
  validateCreateCity,
  validateUpdateCity,
  validateCityId,
  validateAddCategoryToCity,
};
