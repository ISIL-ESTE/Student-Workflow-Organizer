import { Router } from 'express';
import * as userController from '@controllers/users_controllers/user_controller';

const router = Router();
router
    .route('/me')
    /**
     * @swagger
     * /api/useron:
     *   get:
     *     summary: Get a list of users
     *     description: Retrieve a list of users from the database.
     *     requestBody:
     *      description: Optional description in *Markdown*
     *     required: false
     *     responses:
     *       200:
     *         description: A list of users.
     *         content:
     *           application/json:
     *             example:
     *               - id: 1
     *                 name: John Doe
     *               - id: 2
     *                 name: Jane Smith
     *     x-swagger-jsdoc:
     *       tryItOutEnabled: true   // Enable "Try it out" by default
     */
    .get(userController.getMe)
    .delete(userController.deleteMe)
    .patch(userController.updateMe);

const userRoutes = (mainrouter: Router) => {
    mainrouter.use('/users', router);
};

export default userRoutes;
