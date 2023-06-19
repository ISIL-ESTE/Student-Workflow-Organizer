const Role = require('./Role');
const { Actions } = require('../../../middlewares/authorization');

module.exports = async () => {
  const role = new Role();
  const superAdmin = {
    type: 'SUPER_ADMIN',
    authorities: Object.values(Actions),
    restrictions: [],
  };
  const admin = {
    type: 'ADMIN',
    authorities: [Actions.BAN_USER, Actions.DELETE_USER],
    restrictions: [],
  };
  const user = {
    type: 'USER',
    authorities: [Actions.UPDATE_CALANDER],
    restrictions: [],
  };
  try {
    await role.createRole(
      superAdmin.type,
      superAdmin.authorities,
      superAdmin.restrictions
    );
    await role.createRole(admin.type, admin.authorities, admin.restrictions);
    await role.createRole(user.type, user.authorities, user.restrictions);
    global.Logger.info(
      `${superAdmin.type}, ${admin.type}, ${user.type} roles created`
    );
  } catch (err) {
    global.Logger.error(err.stack);
  }
};
