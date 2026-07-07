const express = require('express');
const router = express.Router();
const suggestedDestinationController = require('../controllers/suggestedDestination.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');
const {
  validateCreateSuggestedDestination,
  validateUpdateSuggestedDestination,
  validateSuggestedDestinationId,
} = require('../validators/suggestedDestination.validator');

// All routes are protected
router.use(authMiddleware);

router.post('/', requireAdmin, validateCreateSuggestedDestination, suggestedDestinationController.createSuggestedDestination);
router.get('/', suggestedDestinationController.getAllSuggestedDestinations);
router.get('/:id', validateSuggestedDestinationId, suggestedDestinationController.getSuggestedDestinationById);
router.put('/:id', requireAdmin, validateUpdateSuggestedDestination, suggestedDestinationController.updateSuggestedDestination);
router.delete('/:id', requireAdmin, validateSuggestedDestinationId, suggestedDestinationController.deleteSuggestedDestination);

module.exports = router;
