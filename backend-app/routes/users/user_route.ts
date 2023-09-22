import { Router } from 'express';
import userController from '../../controllers/users_controllers/user_controller';

const router = Router();
router
    .route('/me')
    .get(userController.getMe)
    .delete(userController.deleteMe)
    .patch(userController.updateMe);

const userRoutes = (mainrouter: Router) => {
    // swaggergenerator.register('user', './routes/users/user_route.js');
    mainrouter.use('/users', router);
};

export default userRoutes;
