const express = require('express');
const {
  addSuperAdmin,
  authorizeOrRestrict,
  addAdmin,
  removeAdmin,
} = require('../controllers/adminController');
const { protect } = require('../controllers/authController');
const { restrictTo, Roles, Actions } = require('../middlewares/authorization');
const router = express.Router();

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
  restrictTo(Roles.SUPER_ADMIN.type, [Actions.UPDATE_USER]),
  addSuperAdmin
);
/**
 * @protected
 * @route PUT /api/v1/admin/add-admin/:userId
 * @description Add admin role to a user
 * @access Super Admin
 * @param {string} userId - Id of the user to add admin role to
 */
router.put(
  '/add-admin/:userId',
  restrictTo(Roles.SUPER_ADMIN.type, [Actions.UPDATE_USER]),
  addAdmin
);

/**
 * @protected
 * @route PUT /api/v1/admin/remove-admin/:userId
 * @description Remove admin role from a user
 * @access Super Admin
 * @param {string} userId - Id of the user to remove admin role from
 */
router.put(
  '/remove-admin/:userId',
  restrictTo(Roles.SUPER_ADMIN.type, [Actions.UPDATE_USER]),
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
  restrictTo(Roles.ADMIN.type, [Actions.UPDATE_USER]),
  authorizeOrRestrict
);
