const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth_controllers/auth_controller');
const { restrictTo } = require('../../middlewares/authorization');
const Actions = require('../../constants/actions');
const {
    addSuperAdmin,
    removeSuperAdmin,
    addAdmin,
    removeAdmin,
} = require('../../controllers/users_controllers/admin_controller');

router.use(authController.restrictTo('SUPER_ADMIN'));

/**
 * @protected
 * @route PUT /api/admin/add-super-admin/:userId
 * @description Add super admin role to a user
 * @access Super Admin
 * @param {string} userId - Id of the user to add super admin role to
 */
router.put(
    '/add-super-admin/:userId',
    restrictTo(Actions.UPDATE_USER),
    addSuperAdmin
);

/*
 * @protected
 * @route PUT /api/admin/remove-super-admin/:userId
 * @description Remove super admin role from a user
 * @access Super Admin
 * @param {string} userId - Id of the user to remove super admin role from
 **/
router.put(
    '/remove-super-admin/:userId',
    restrictTo(Actions.UPDATE_USER, Actions.REMOVE_SUPER_ADMIN),
    removeSuperAdmin
);

/**
 * @protected
 * @route PUT /api/admin/add-admin/:userId
 * @description Add admin role to a user
 * @access Super Admin
 * @param {string} userId - Id of the user to add admin role to
 */
router.put('/add-admin/:userId', restrictTo(Actions.UPDATE_USER), addAdmin);

/**
 * @protected
 * @route PUT /api/admin/remove-admin/:userId
 * @description Remove admin role from a user
 * @access Super Admin
 * @param {string} userId - Id of the user to remove admin role from
 */
router.put(
    '/remove-admin/:userId',
    restrictTo(Actions.UPDATE_USER),
    removeAdmin
);

superAdminRoutes = (mainrouter) => {
    // swaggergenerator.register(
    //   'super_admin',
    //   './routes/users/super_admin_route.js'
    // );
    mainrouter.use('/super_admin', router);
};
module.exports = superAdminRoutes;
