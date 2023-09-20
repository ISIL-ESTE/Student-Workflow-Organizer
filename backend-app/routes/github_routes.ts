import { Router } from 'express';
const router = Router();
import * as githubController from '../controllers/auth_controllers/github_controller';

router.get('/recent-repo', githubController.getRecentRepo);

const githubRoutes = (mainrouter: Router) => {
    // swaggergenerator.register('github', './routes/github_routes.js');
    mainrouter.use('/github', router);
};

export default githubRoutes;
