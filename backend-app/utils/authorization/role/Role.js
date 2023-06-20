const AppError = require('../../appError');
const roleModel = require('../../../models/roleModel');
const Actions = require('../../../constants/Actions');
class Role {
  roleModel = roleModel;

  _isRoleName(roleName) {
    if (!roleName || typeof roleName !== 'string')
      throw new AppError(400, 'fail', 'Invalid role name!');
    return;
  }
  /**
   * Get all roles from database.
   */
  async getRoles() {
    const data = {};
    const roles = await this.roleModel.find();

    roles.forEach((role) => {
      data[role.name] = {
        type: role.name,
        authorities: role.authorities,
        restrictions: role.restrictions,
      };
    });
    return data;
  }
  /**
   * Get role by name from database.
   * @param {string} roleName
   * @returns {Promise<{type: string, authorities: string[], restrictions: string[]}>}
   */
  async getRoleByName(roleName) {
    this._isRoleName(roleName);
    const role = await this.roleModel.findOne({ name: roleName });
    if (!role) return null;
    return {
      type: role.name,
      authorities: role.authorities,
      restrictions: role.restrictions,
    };
  }
  /**
   * Delete role by name from database.
   * @param {string} roleName
   * @returns {Promise<{type: string, authorities: string[], restrictions: string[]}>}
   */
  async deleteRoleByName(roleName) {
    this._isRoleName(roleName);
    if (!this.getRoleByName(roleName))
      throw new AppError(404, 'fail', 'Role not found!');
    const deletedRole = await this.roleModel.findOneAndDelete(
      { name: roleName },
      { new: true }
    );
    return this._Exist(
      {
        type: deletedRole.name,
        authorities: deletedRole.authorities,
        restrictions: deletedRole.restrictions,
      },
      new AppError(404, 'fail', 'Role not found!')
    );
  }
  /**
   * Create role by name from database.
   * @param {string} roleName
   * @param {string[]} authorities
   * @param {string[]} restrictions
   * @returns {Promise<{type: string, authorities: string[], restrictions: string[]}>}
   */
  async createRole(roleName, authorities, restrictions) {
    this._isRoleName(roleName);
    if (await this.getRoleByName(roleName)) return;
    authorities ||
      [].forEach((authority) => {
        if (!Object.values(Actions).includes(authority))
          throw new AppError(400, 'fail', 'Invalid authority!');
      });
    restrictions ||
      [].forEach((restriction) => {
        if (!Object.values(Actions).includes(restriction))
          throw new AppError(400, 'fail', 'Invalid restriction!');
      });
    const role = await this.roleModel.create({
      name: roleName,
      authorities,
      restrictions,
    });
    return {
      type: role.name,
      authorities: role.authorities,
      restrictions: role.restrictions,
    };
  }
  /**
   * Delete default roles from database.
   */
  async deleteDefaultRoles() {
    await this.roleModel.deleteMany({
      name: { $in: ['SUPER_ADMIN', 'ADMIN', 'USER'] },
    });
  }
}

module.exports = Role;
