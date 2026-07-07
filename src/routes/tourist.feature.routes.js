const express = require('express');
const router = express.Router();
const touristFeatureController = require('../controllers/tourist.feature.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const {
  validateToggleLike,
  validateAddActivity,
  validateSubmitQuiz,
} = require('../validators/tourist.validator');

// All routes here require authentication
router.use(authMiddleware);

// Likes
router.post('/likes', validateToggleLike, touristFeatureController.toggleLike);
router.get('/likes', touristFeatureController.getMyLikes);

// Activities
router.post('/activities', validateAddActivity, touristFeatureController.addActivity);
router.get('/activities', touristFeatureController.getMyActivities);
router.delete('/activities/:activity_id', touristFeatureController.deleteActivity);

// Quizzes
router.post('/quiz/submit', validateSubmitQuiz, touristFeatureController.submitQuiz);

module.exports = router;
