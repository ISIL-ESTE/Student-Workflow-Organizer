const AppError = require('../utils/appError');
const { Request, Response, NextFunction } = require('express');

/**
 * @enum {string}
 */
const Actions = {
  DELETE_USER: 'DELETE_USER',
  BAN_USER: 'BAN_USER',
  UPDATE_USER: 'UPDATE_USER',
  UPDATE_CALANDER: 'UPDATE_CALANDER',
  REMOVE_SUPER_ADMIN: 'REMOVE_SUPER_ADMIN',
};
Object.freeze(Actions);

const Roles = {
  SUPER_ADMIN: {
    type: 'SUPER_ADMIN',
    authorities: Object.values(Actions),
    restrictions: [],
  },
  ADMIN: {
    type: 'ADMIN',
    authorities: [Actions.DELETE_USER, Actions.UPDATE_USER, Actions.BAN_USER],
    restrictions: [],
  },
  USER: {
    type: 'USER',
    authorities: [Actions.UPDATE_CALANDER],
    restrictions: [],
  },
};
Object.freeze(Roles);

/**
 *
 * @param {{authorities:string[]}} user
 * @param {string[]} actions
 * @returns {boolean}
 */
const hasAuthority = (user, actions) =>
  actions.every((action) => user.authorities.includes(action));

/**
 * @param {{roles:string[]}} user
 * @param { string[] } requiredRoles
 * @param { string[] }actions
 * @returns {boolean}
 *
 */
const hasPermission = (user, acceptedRole, actions) => {
  const result = user.roles
    .map((role) => acceptedRole.includes(role))
    .find((val) => val === true);
  if (!result) return false;
  if (hasAuthority(user, actions)) return true;
  return false;
};
/**
 *
 * @param {{restrictions:string[]}} user
 * @param {string[]} actions
 * @returns {boolean}
 */
const isRestricted = (user, actions) =>
  actions.every((action) => !user.restrictions.includes(action)) ? false : true;

/**
 * @param {...string} roles
 * @returns {(...actions:string[])=>(req:Request,res:Response,next:NextFunction)=>void}
 */
const restrictTo =
  (...roles) =>
  (...actions) =>
  (req, res, next) => {
    if (hasPermission(req.user, roles, actions)) {
      if (!isRestricted(req.user, actions)) next();
      else
        next(
          new AppError(
            403,
            'fail',
            'You do not have permission to perform this action'
          )
        );
    } else
      next(
        new AppError(
          403,
          'fail',
          'You do not have permission to perform this action'
        )
      );
  };

module.exports = {
  restrictTo,
  Actions,
  Roles,
};
