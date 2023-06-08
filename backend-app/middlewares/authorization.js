const AppError = require('../utils/appError');

//Enum
const Actions = {
  DELETE_USER: 'DELETE_USER',
  UPDATE_USER: 'UPDATE_USER',
  UPDATE_CALANDER: 'UPDATE_CALANDER',
};
Object.freeze(Actions);

// Enum
const Roles = {
  SUPER_ADMIN: {
    type: 'SUPER_ADMIN',
    authorities: Object.values(Actions),
    restrictions: [],
  },
  ADMIN: {
    type: 'ADMIN',
    authorities: [Actions.DELETE_USER, Actions.UPDATE_USER],
    restrictions: [Actions.UPDATE_CALANDER],
  },
  USER: {
    type: 'USER',
    authorities: [Actions.UPDATE_CALANDER],
    restrictions: [Actions.DELETE_USER],
  },
};
Object.freeze(Roles);

/**
 *
 * @param {{authorities:string[]}} user
 * @param {string[]} actions
 * @returns {boolean}
 */
const hasAuthority = (user, actions) => {
  return actions.every((action) => user.authorities.includes(action));
};

/**
 * @param {{role:string}} user
 * @param { string } requiredRole
 * @param { string[] }actions
 * @returns {boolean}
 *
 */
const hasPermission = (user, requiredRole, actions) => {
  if (user.role === requiredRole) if (hasAuthority(user, actions)) return true;
  return false;
};
/**
 *
 * @param {{restrictions:string[]}} user
 * @param {string[]} actions
 * @returns {boolean}
 */
const isRestricted = (user, actions) => {
  return actions.every((action) => !user.restrictions.includes(action));
};

/**
 *
 * @param { string[] } actions
 * @param  { string } role
 * @returns
 */
const restrictTo = (role, actions) => {
  return (req, res, next) => {
    if (hasPermission(req.user, role, actions)) {
      if (!isRestricted(req.user, actions)) {
        next();
      }
    }
    next(
      new AppError(
        403,
        'fail',
        'You do not have permission to perform this action'
      ),
      req,
      res,
      next
    );
  };
};

module.exports = {
  restrictTo,
  Actions,
  Roles,
};
