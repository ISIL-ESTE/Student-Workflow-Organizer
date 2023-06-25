const Actions = require('./Actions');
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

module.exports = Roles;
