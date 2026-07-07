const { body, param } = require('express-validator');
const { handleValidationErrors } = require('./index');

const validateCreateQuestion = [
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Question text is required'),
  handleValidationErrors,
];

const validateUpdateQuestion = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Question ID must be a positive integer'),
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Question text is required'),
  handleValidationErrors,
];

const validateQuestionId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Question ID must be a positive integer'),
  handleValidationErrors,
];

const validateCreateOption = [
  param('ques_id')
    .isInt({ min: 1 })
    .withMessage('Question ID must be a positive integer'),
  body('text')
    .trim()
    .notEmpty()
    .withMessage('Option text is required'),
  body('sug_des_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Suggested destination ID must be a positive integer'),
  handleValidationErrors,
];

const validateOptionId = [
  param('option_id')
    .isInt({ min: 1 })
    .withMessage('Option ID must be a positive integer'),
  handleValidationErrors,
];

module.exports = {
  validateCreateQuestion,
  validateUpdateQuestion,
  validateQuestionId,
  validateCreateOption,
  validateOptionId,
};
