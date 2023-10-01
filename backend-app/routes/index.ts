import { Router } from 'express';
import userRoutes from './users/user_route';
import adminRoutes from './users/admin_route';
import superAdminRoutes from './users/super_admin_route';
import authRoutes from './auth_routes';
import githubRoutes from './github_routes';
import { protect } from '../controllers/auth_controllers/auth_controller';

const router = Router();

// public routes
authRoutes(router);

router.use(protect);

// protected routes
userRoutes(router);
adminRoutes(router);
superAdminRoutes(router);
githubRoutes(router);

export default router;
