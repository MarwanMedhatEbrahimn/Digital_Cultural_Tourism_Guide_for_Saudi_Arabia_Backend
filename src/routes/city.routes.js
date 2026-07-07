const express = require('express');
const router = express.Router();
const cityController = require('../controllers/city.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');
const { uploadCityImages } = require('../middlewares/upload.middleware');
const {
  validateCreateCity,
  validateUpdateCity,
  validateCityId,
  validateAddCategoryToCity,
} = require('../validators/city.validator');

// Public routes
router.get('/', cityController.getAllCities);
router.get('/:id', validateCityId, cityController.getCityById);
router.get('/:id/categories', validateCityId, cityController.getCategoriesByCity);

// Protected admin routes
router.use(authMiddleware);

router.post(
  '/',
  requireAdmin,
  uploadCityImages,
  validateCreateCity,
  cityController.createCity,
);

router.put(
  '/:id',
  requireAdmin,
  uploadCityImages,
  validateUpdateCity,
  cityController.updateCity,
);

router.delete('/:id', requireAdmin, validateCityId, cityController.deleteCity);

router.post(
  '/:id/categories',
  requireAdmin,
  validateAddCategoryToCity,
  cityController.addCategoryToCity,
);

module.exports = router;
