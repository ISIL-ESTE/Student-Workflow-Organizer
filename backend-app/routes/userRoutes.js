const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { deserializeUser } = require('../middlewares/authentication');

/*
 * @route POST /api/v1/users/login
 * @description Login
 * @access public
 **/
router.post('/login', authController.login);
/*
 * @route POST /api/v1/users/signup
 * @description Signup
 * @access public
 **/
router.post('/signup', authController.signup);
/*
 * @route PUT /api/v1/users/token-refresh
 * @description Refresh access token
 * @access Public
 **/
router.put('/token-refresh', authController.tokenRefresh);
router.use(deserializeUser);
/*
 * @route DELETE /api/v1/users/logout
 * @description logout
 * @access Private
 **/
router.delete('/logout', authController.logout);
router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo(['ADMIN', 'SUPER_ADMIN']));

router.route('/').get(userController.getAllUsers);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
