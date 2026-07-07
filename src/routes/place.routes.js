const express = require('express');
const router = express.Router();
const placeController = require('../controllers/place.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');
const { uploadPlaceImages } = require('../middlewares/upload.middleware');
const {
  validateCreatePlace,
  validateUpdatePlace,
  validatePlaceId,
} = require('../validators/place.validator');

// Public routes
router.get('/', placeController.getAllPlaces);
router.get('/:id', validatePlaceId, placeController.getPlaceById);

// Protected admin routes
router.use(authMiddleware);

router.post(
  '/',
  requireAdmin,
  uploadPlaceImages,
  validateCreatePlace,
  placeController.createPlace,
);

router.put(
  '/:id',
  requireAdmin,
  uploadPlaceImages,
  validateUpdatePlace,
  placeController.updatePlace,
);

router.delete('/:id', requireAdmin, validatePlaceId, placeController.deletePlace);

module.exports = router;
