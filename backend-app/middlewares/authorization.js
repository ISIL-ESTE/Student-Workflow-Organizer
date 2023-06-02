const AppError = require('../utils/appError');

//Enum
const Authorities = {};
Object.freeze(Authorities);

// Enum
const Restrictions = {};
Object.freeze(Restrictions);

// Enum
const Roles = {};
Object.freeze(Roles);

/**
 *
 * @param {string} role
 * @param { string[]} requiredAuthorities
 * @returns {boolean}
 */
const hasAuthority = (role, requiredAuthorities) => {
  for (const authority of requiredAuthorities)
    if (Roles[role].includes(authority)) return true;
  return false;
};

/**
 * @param {{roles:string[]}} user
 * @param { string[] } requiredRoles
 * @param { string[] } requiredAuthorities
 * @returns {boolean}
 *
 */
const hasPermission = (user, requiredRoles, requiredAuthorities) => {
  for (const role of requiredRoles)
    if (user.roles.includes(role))
      if (hasAuthority(role, requiredAuthorities)) return true;
  return false;
};
/**
 *
 * @param {{restrictions:string[]}} user
 * @param {string[]} actions
 * @returns {boolean}
 */
const isRestricted = (user, actions) => {
  return actions.every((action) => user.restrictions.includes(action));
};

/**
 *
 * @param { string[] } action
 * @param  { string[] } roles
 * @returns
 */
exports.restrictTo = (roles, actions, authorities) => {
  return (req, res, next) => {
    if (hasPermission(req.user, roles, authorities)) {
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
