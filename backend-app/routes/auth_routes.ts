import * as authController from '@controllers/auth_controllers/auth_controller';
import * as password_management from '@controllers/auth_controllers/password_management';
import express, { Router } from 'express';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.delete('/logout', authController.logout);
router.get('/refreshToken', authController.tokenRefresh);
router.get('/activate', authController.activateAccount);
router.patch('/forgotPassword', password_management.forgotPassword);
router.patch('/updateMyPassword', password_management.updatePassword);
router.get('/github/callback', authController.githubHandler);

const authRoutes = (mainrouter: Router) => {
    mainrouter.use('/auth', router);
};

export default authRoutes;
