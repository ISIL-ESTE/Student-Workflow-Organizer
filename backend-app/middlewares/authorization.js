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
 * @param {{authorities:string[]}} user
 * @param {string[]} requiredAuthorities
 * @returns {boolean}
 */
const hasAuthority = (user, requiredAuthorities) => {
  return requiredAuthorities.every((authority) =>
    user.authorities.includes(authority)
  );
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
      if (hasAuthority(user, requiredAuthorities)) return true;
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
const restrictTo = (roles, actions, requiredAuthorities) => {
  return (req, res, next) => {
    if (hasPermission(req.user, roles, requiredAuthorities)) {
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
  Authorities,
  Restrictions,
  Roles,
};
