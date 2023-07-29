const express = require('express');
const swaggergenerator = require('../../utils/swagger/swaggergenerator');
const userController = require('../../controllers/user_controller');
const router = express.Router();

router
    .route('/me')
    .get(userController.getMe)
    .delete(userController.deleteMe)
    .patch(userController.updateMe);

userRoutes = (mainrouter) => {
    // swaggergenerator.register('user', './routes/users/user_route.js');
    mainrouter.use('/users', router);
};

module.exports = userRoutes;
