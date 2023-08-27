const { Router } = require('express');
const router = Router();
const githubController = require('../controllers/auth_controllers/github_controller');

router.get('/recent-repo', githubController.getRecentRepo);

const githubRoutes = (mainrouter) => {
    // swaggergenerator.register('github', './routes/github_routes.js');
    mainrouter.use('/github', router);
};

module.exports = githubRoutes;
