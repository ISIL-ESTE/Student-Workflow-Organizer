import { Router } from 'express';
import {
    authorizeOrRestrict,
    banUser,
    unbanUser,
    createRole,
    updateRole,
    getRole,
    getRoles,
    deleteRole,
    assignRoleToUser,
    removeRoleFromUser,
} from '@controllers/users_controllers/admin_controller';
import * as authController from '@controllers/auth_controllers/auth_controller';
import restrictTo from '@middlewares/authorization';
import Actions from '@constants/actions';
import * as userController from '@controllers/users_controllers/user_controller';

/**
 * Below all routes are protected
 */

const router = Router();

router.use(authController.restrictTo('ADMIN', 'SUPER_ADMIN'));

router
    .route('/user/:id')
    .get(userController.getUser)
    .patch(userController.updateUser)
    .delete(userController.deleteUser);
router.get('/users', userController.getAllUsers);

/**
 * @protected
 * @route PUT /api/admin/remove-super-admin/:userId
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
 * @route PUT /api/admin/ban-user/:userId
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
 * @route PUT /api/admin/unban-user/:userId
 * @description unban a user
 * @access Super Admin
 * @param {string} userId - Id of the user to unban
 **/
router.put(
    '/unban-user/:userId',
    restrictTo(Actions.UPDATE_USER, Actions.BAN_USER),
    unbanUser
);

/**
 * @protected
 * @route PUT /api/admin/role
 * @description Get all roles
 * @access Super Admin
 **/
router.put('/role', restrictTo(Actions.MANAGE_ROLES), getRoles);

/**
 * @protected
 * @route PUT /api/admin/role/:name
 * @description Get a single role
 * @access Super Admin
 * @param {string} name - Name of the role to find
 **/
router.put('/role/:name', restrictTo(Actions.MANAGE_ROLES), getRole);

/**
 * @protected
 * @route POST /api/admin/role
 * @description Create a role
 * @access Super Admin
 **/
router.post('/role', restrictTo(Actions.MANAGE_ROLES), createRole);

/**
 * @protected
 * @route PUT /api/admin/role/:name
 * @description Update a role
 * @access Super Admin
 * @param {string} name - Name of the role to update
 **/
router.put('/role/:name', restrictTo(Actions.MANAGE_ROLES), updateRole);

/**
 * @protected
 * @route DELETE /api/admin/role/:name
 * @description Delete a role
 * @access Super Admin
 * @param {string} name - Name of the role to delete
 **/
router.delete('/role/:name', restrictTo(Actions.MANAGE_ROLES), deleteRole);

/**
 * @protected
 * @route PUT /api/admin/assign-role/:name/:userId
 * @description Assign a role to a user
 * @access Super Admin
 * @param {string} name - Name of the role to assign
 * @param {string} userId - Id of the user to assign the role to
 * */
router.put(
    '/assign-role/:name/:userId',
    restrictTo(Actions.MANAGE_ROLES),
    assignRoleToUser
);
/**
 * @protected
 * @route PUT /api/admin/remove-role/:name/:userId
 * @description Remove a role from a user
 * @access Super Admin
 * @param {string} name - Name of the role to remove
 * @param {string} userId - Id of the user to remove the role from
 * */
router.put(
    '/remove-role/:name/:userId',
    restrictTo(Actions.MANAGE_ROLES),
    removeRoleFromUser
);

const adminRoutes = (mainrouter: Router) => {
    // swaggergenerator.register('admin', './routes/users/admin_route.js');
    mainrouter.use('/admin', router);
};
export default adminRoutes;
