const AppError = require('../utils/app_error');
const { Request, Response, NextFunction } = require('express');
const Actions = require('../constants/actions');

/**
 *
 * @param {{authorities:string[]}} user
 * @param {string[]} actions
 * @returns {boolean}
 */
const hasAuthority = (user, actions) =>
    actions.every((action) => user.authorities.includes(action));

/**
 *
 * @param {{restrictions:string[]}} user
 * @param {string[]} actions
 * @returns {boolean}
 */
const isRestricted = (user, actions) =>
    actions.every((action) => !user.restrictions.includes(action))
        ? false
        : true;

/**
 * @param {...string} roles
 * @returns {(...actions:string[])=>(req:Request,res:Response,next:NextFunction)=>void}
 */
const restrictTo =
    (...actions) =>
    (req, res, next) => {
        if (hasAuthority(req.user, actions)) {
            if (!isRestricted(req.user, actions)) next();
            else
                next(
                    new AppError(
                        403,
                        'fail',
                        'You are restricted from performing this action, contact the admin for more information'
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
};
