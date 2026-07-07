const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');
const {
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoryId,
  validateAssignCities,
} = require('../validators/category.validator');

// Public routes
router.get('/', categoryController.getAllCategories);
router.get('/:id', validateCategoryId, categoryController.getCategoryById);
router.get('/:id/cities', validateCategoryId, categoryController.getCitiesByCategory);

// Protected admin routes
router.use(authMiddleware);

router.post('/', requireAdmin, validateCreateCategory, categoryController.createCategory);
router.put('/:id', requireAdmin, validateUpdateCategory, categoryController.updateCategory);
router.delete('/:id', requireAdmin, validateCategoryId, categoryController.deleteCategory);
router.post('/:id/assign-cities', requireAdmin, validateAssignCities, categoryController.assignCategoryToCities);
router.post('/:id/remove-cities', requireAdmin, validateAssignCities, categoryController.removeCategoryFromCities);

module.exports = router;
