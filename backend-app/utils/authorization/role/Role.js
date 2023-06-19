const AppError = require('../appError');
const { Types } = require('mongoose');
const roleModel = require('../../models/roleModel');
const { Actions, Roles } = require('../../middlewares/authorization');
class Role {
  roleModel = roleModel;

  _Exist(data, err) {
    if (data) return data;
    else throw err;
  }
  _isRoleName(roleName) {
    if (!roleName || typeof roleName !== 'string' || roleName?.length <= 0)
      throw new AppError(400, 'fail', 'Invalid role name!');
    return;
  }
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
  async getRoleByName(roleName) {
    this._isRoleName(roleName);
    const role = await this.roleModel.findOne({ name: roleName });
    return this._Exist(
      {
        type: role.name,
        authorities: role.authorities,
        restrictions: role.restrictions,
      },
      new AppError(404, 'fail', 'Role not found!')
    );
  }
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
   *
   * @param {string} roleName
   * @param {keyof Actions} authorities
   * @param {keyof Actions} restrictions
   */
  async createRole(roleName, authorities, restrictions) {
    this._isRoleName(roleName);
    if (this.getRoleByName(roleName))
      throw new AppError(400, 'fail', 'Role already exists with this name!');
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
    return this._Exist(
      {
        type: role.name,
        authorities: role.authorities,
        restrictions: role.restrictions,
      },
      new AppError(500, 'fail', 'Internal server error!')
    );
  }
}

module.exports = Role;
