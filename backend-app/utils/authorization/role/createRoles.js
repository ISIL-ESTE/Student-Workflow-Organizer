const Role = require('./Role');
const { Actions } = require('../../../middlewares/authorization');

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

const createRoles = async () => {
  const role = new Role();
  try {
    await role.deleteDefaultRoles();
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
    global.Logger.warn(await role.getRoles());
  } catch (err) {
    global.Logger.error(err.stack);
  }
};
module.exports = createRoles;
