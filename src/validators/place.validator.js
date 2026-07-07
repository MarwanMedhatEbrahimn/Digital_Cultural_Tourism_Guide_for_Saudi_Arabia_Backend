const { body, param } = require('express-validator');
const { handleValidationErrors } = require('./index');

const validateCreatePlace = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Place name is required')
    .isLength({ max: 255 })
    .withMessage('Place name must not exceed 255 characters'),
  body('name_ar')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Arabic place name must not exceed 255 characters'),
  body('description')
    .optional()
    .trim(),
  body('description_ar')
    .optional()
    .trim(),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Location must not exceed 500 characters'),
  body('location_ar')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Arabic location must not exceed 500 characters'),
  body('cate_id')
    .notEmpty()
    .withMessage('Category ID is required')
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  body('city_id')
    .notEmpty()
    .withMessage('City ID is required')
    .isInt({ min: 1 })
    .withMessage('City ID must be a positive integer'),
  handleValidationErrors,
];

const validateUpdatePlace = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Place ID must be a positive integer'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Place name must be between 1 and 255 characters'),
  body('name_ar')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Arabic place name must not exceed 255 characters'),
  body('description')
    .optional()
    .trim(),
  body('description_ar')
    .optional()
    .trim(),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Location must not exceed 500 characters'),
  body('location_ar')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Arabic location must not exceed 500 characters'),
  body('cate_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Category ID must be a positive integer'),
  body('city_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('City ID must be a positive integer'),
  handleValidationErrors,
];

const validatePlaceId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Place ID must be a positive integer'),
  handleValidationErrors,
];

module.exports = {
  validateCreatePlace,
  validateUpdatePlace,
  validatePlaceId,
};
