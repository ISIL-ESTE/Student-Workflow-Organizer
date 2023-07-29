const express = require('express');
const router = express.Router();

const userRoutes = require('./users/user_route');
const adminRoutes = require('./users/admin_route');
const superAdminRoutes = require('./users/super_admin_route');
const authRoutes = require('./auth_routes');
const githubRoutes = require('./github_routes');
const authController = require('../controllers/auth_controller');

// public routes
authRoutes(router);

router.use(authController.protect);

// protected routes
userRoutes(router);
adminRoutes(router);
superAdminRoutes(router);
githubRoutes(router);
module.exports = router;
