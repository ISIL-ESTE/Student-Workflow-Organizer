import { Router } from 'express';
const router = Router();
import * as githubController from '../controllers/auth_controllers/github_controller';

router.get('/recent-repo', githubController.getRecentRepo);

/**
 * Registers the GitHub routes with the main router and adds them to the Swagger documentation.
 * @function
 * @name githubRoutes
 * @param {Object} mainrouter - Express router object.
 */
const githubRoutes = (mainrouter: Router) => {
    mainrouter.use('/github', router);
};

export default githubRoutes;
