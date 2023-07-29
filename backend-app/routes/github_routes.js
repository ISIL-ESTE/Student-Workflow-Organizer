const { Router } = require('express');
const router = Router();
const githubController = require('../controllers/github_controller');
const swaggergenerator = require('../utils/swagger/swaggergenerator');

router.get('/recent-repo', githubController.getRecentRepo);

const githubRoutes = (mainrouter) => {
    // swaggergenerator.register('github', './routes/github_routes.js');
    mainrouter.use('/github', router);
};

module.exports = githubRoutes;
