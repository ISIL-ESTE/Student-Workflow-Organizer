import Actions from '@constants/actions';

/**
 * Validate all the actions in the array
 * @param {string[]} actions
 * @returns boolean
 */
const validateActions = (actions: string[]): boolean =>
    actions.every((action) => Object.values(Actions).includes(action));

export default validateActions;
