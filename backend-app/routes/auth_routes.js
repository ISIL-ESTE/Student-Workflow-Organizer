const authController = require('../controllers/auth_controller');
const swaggergenerator = require('../utils/swagger/swaggergenerator');
const express = require('express');
const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/activate', authController.activateAccount);
router.patch('/updateMyPassword', authController.updatePassword);
router.patch('/forgotPassword', authController.forgotPassword);
router.get('/github/callback', authController.githubHandler);

// make this file so i can use it with authRoutes(router) in index.js
const authRoutes = (mainrouter) => {
    // swaggergenerator.register('auth', './routes/auth_routes.js');
    mainrouter.use('/auth', router);
};
module.exports = authRoutes;
