const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const adminUsersController = require('../controllers/admin.users.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const { requireAdmin } = require('../middlewares/role.middleware');
const {
  validateTouristUserId,
  validateAdminUpdateUser,
} = require('../validators/admin.users.validator');

// All dashboard routes require admin authentication
router.use(authMiddleware);

router.get('/', requireAdmin, dashboardController.getStats);

// App users (tourists) — list and manage from admin
router.get('/users', requireAdmin, adminUsersController.getUsers);
router.get(
  '/users/:id',
  requireAdmin,
  validateTouristUserId,
  adminUsersController.getUserById,
);
router.put(
  '/users/:id',
  requireAdmin,
  validateAdminUpdateUser,
  adminUsersController.updateUser,
);

module.exports = router;
