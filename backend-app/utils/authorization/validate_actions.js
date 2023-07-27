const Actions = require('../../constants/actions');

/**
 * Validate all the actions in the array
 * @param {string[]} actions
 * @returns boolean
 */
const validateActions = (actions) =>
    actions.every((action) => Object.values(Actions).includes(action));

module.exports = validateActions;
