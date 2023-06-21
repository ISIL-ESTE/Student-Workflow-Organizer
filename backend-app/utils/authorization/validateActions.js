const Actions = require('../../constants/Actions');

/**
 * Validate all the actions in the array
 * @param {string[]} actions
 * @returns boolean
 */
const validateActions = (actions) =>
  actions.every((action) => Object.values(Actions).includes(action));

module.exports = validateActions;
