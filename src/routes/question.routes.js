const express = require('express');
const router = express.Router();
const questionController = require('../controllers/question.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');
const {
  validateCreateQuestion,
  validateUpdateQuestion,
  validateQuestionId,
  validateCreateOption,
  validateOptionId,
} = require('../validators/question.validator');

// All routes are protected
router.use(authMiddleware);

// Question routes
router.post('/', requireAdmin, validateCreateQuestion, questionController.createQuestion);
router.get('/', questionController.getAllQuestions);
router.get('/:id', validateQuestionId, questionController.getQuestionById);
router.put('/:id', requireAdmin, validateUpdateQuestion, questionController.updateQuestion);
router.delete('/:id', requireAdmin, validateQuestionId, questionController.deleteQuestion);

// Option routes
router.post('/:ques_id/options', requireAdmin, validateCreateOption, questionController.createOption);
router.delete('/options/:option_id', requireAdmin, validateOptionId, questionController.deleteOption);

module.exports = router;
