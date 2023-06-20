const express = require('express');
const {
  addSuperAdmin,
  removeSuperAdmin,
  authorizeOrRestrict,
  addAdmin,
  removeAdmin,
  banUser,
  unbanUser,
} = require('../controllers/adminController');
const { protect } = require('../controllers/authController');
const { restrictTo } = require('../middlewares/authorization');
const router = express.Router();
const Actions = require('../constants/Actions');
const Roles = require('../constants/defaultRoles');

/**
 * Below all routes are protected
 */
router.use(protect);

/**
 * @protected
 * @route PUT /api/v1/admin/add-super-admin/:userId
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
 * @route PUT /api/v1/admin/remove-super-admin/:userId
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
 * @route PUT /api/v1/admin/add-admin/:userId
 * @description Add admin role to a user
 * @access Super Admin
 * @param {string} userId - Id of the user to add admin role to
 */
router.put('/add-admin/:userId', restrictTo(Actions.UPDATE_USER), addAdmin);

/**
 * @protected
 * @route PUT /api/v1/admin/remove-admin/:userId
 * @description Remove admin role from a user
 * @access Super Admin
 * @param {string} userId - Id of the user to remove admin role from
 */
router.put(
  '/remove-admin/:userId',
  restrictTo(Actions.UPDATE_USER),
  removeAdmin
);

/**
 * @protected
 * @route PUT /api/v1/admin/remove-super-admin/:userId
 * @description Add authorizations and restrictions to a user
 * @access Super Admin
 * @param {string} userId - Id of the user to add authorizations and restrictions
 * @param {string[]} authorizations - List of authorizations to add to the user
 * @param {string[]} restrictions - List of restrictions to add to the user
 */
router.put(
  '/authorize-or-restrict/:userId',
  restrictTo(Actions.UPDATE_USER),
  authorizeOrRestrict
);

/**
 * @protected
 * @route PUT /api/v1/admin/ban-user/:userId
 * @description ban a user
 * @access Super Admin
 * @param {string} userId - Id of the user to ban
 **/
router.put(
  '/ban-user/:userId',
  restrictTo(Actions.UPDATE_USER, Actions.BAN_USER),
  banUser
);

/**
 * @protected
 * @route PUT /api/v1/admin/unban-user/:userId
 * @description unban a user
 * @access Super Admin
 * @param {string} userId - Id of the user to unban
 **/
router.put(
  '/unban-user/:userId',
  restrictTo(Actions.UPDATE_USER, Actions.BAN_USER),
  unbanUser
);

module.exports = router;
