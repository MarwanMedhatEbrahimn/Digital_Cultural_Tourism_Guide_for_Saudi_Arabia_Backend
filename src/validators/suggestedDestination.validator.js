const { body, param } = require('express-validator');
const { handleValidationErrors } = require('./index');

const validateCreateSuggestedDestination = [
  body('topic')
    .trim()
    .notEmpty()
    .withMessage('Topic is required')
    .isLength({ max: 255 })
    .withMessage('Topic must not exceed 255 characters'),
  body('description')
    .optional()
    .trim(),
  handleValidationErrors,
];

const validateUpdateSuggestedDestination = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Suggested destination ID must be a positive integer'),
  body('topic')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Topic must be between 1 and 255 characters'),
  body('description')
    .optional()
    .trim(),
  handleValidationErrors,
];

const validateSuggestedDestinationId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Suggested destination ID must be a positive integer'),
  handleValidationErrors,
];

module.exports = {
  validateCreateSuggestedDestination,
  validateUpdateSuggestedDestination,
  validateSuggestedDestinationId,
};
