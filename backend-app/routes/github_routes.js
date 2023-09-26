const { Router } = require('express');
const router = Router();
const githubController = require('../controllers/auth_controllers/github_controller');

router.get('/recent-repo', githubController.getRecentRepo);

/**
 * Registers the GitHub routes with the main router and adds them to the Swagger documentation.
 * @function
 * @name githubRoutes
 * @param {Object} mainrouter - Express router object.
 */
const githubRoutes = (mainrouter) => {
    mainrouter.use('/github', router);
};

module.exports = githubRoutes;
