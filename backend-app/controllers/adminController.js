const userModel = require('../models/userModel');
const Actions = require('../constants/Actions');
const validateActions = require('../utils/authorization/validateActions');
const Role = require('../utils/authorization/role/Role');
const AppError = require('../utils/appError');
const role = new Role();

exports.addAdmin = async (req, res, next) => {
  try {
    const Roles = await role.getRoles();
    const { userId } = req.params;
    const user = await userModel.findById(userId);
    if (!user) throw new AppError(404, 'fail', 'No user found with this id');
    if (req.user._id?.toString() === userId?.toString())
      throw new AppError(400, 'fail', 'You cannot make yourself an admin');
    if (user.roles?.includes(Roles.ADMIN.type))
      throw new AppError(400, 'fail', 'User is already an admin');
    user.roles?.push(Roles.ADMIN.type);
    const existingAuthorities = user.authorities;
    const existingRestrictions = user.restrictions;
    user.authorities = Array.from(
      new Set([...Roles.ADMIN.authorities, ...existingAuthorities])
    );
    user.restrictions = Array.from(
      new Set([...Roles.ADMIN.restrictions, ...existingRestrictions])
    );
    await user.save();
    res.status(200).json({
      status: 'success',
      message: 'User is now an admin',
    });
  } catch (err) {
    next(err);
  }
};

exports.removeAdmin = async (req, res, next) => {
  try {
    const Roles = await role.getRoles();
    const { userId } = req.params;
    const user = await userModel.findById(userId);
    if (!user) throw new AppError(404, 'fail', 'No user found with this id');
    if (req.user._id?.toString() === userId?.toString())
      throw new AppError(400, 'fail', 'You cannot remove yourself as an admin');
    if (!user.roles?.includes(Roles.ADMIN.type))
      throw new AppError(400, 'fail', 'User is not an admin');
    user.roles = user.roles.filter((role) => role !== Roles.ADMIN.type);
    user.authorities = Roles.USER.authorities;
    user.restrictions = Roles.USER.restrictions;
    await user.save();
    res.status(200).json({
      status: 'success',
      message: 'User is no longer an admin',
    });
  } catch (err) {
    next(err);
  }
};

exports.addSuperAdmin = async (req, res, next) => {
  try {
    const Roles = await role.getRoles();
    const { userId } = req.params;
    const user = await userModel.findById(userId);
    if (!user) throw new AppError(404, 'fail', 'No user found with this id');
    if (req.user._id?.toString() === userId?.toString())
      throw new AppError(400, 'fail', 'You cannot make yourself a super admin');
    if (user.roles?.includes(Roles.SUPER_ADMIN.type))
      throw new AppError(400, 'fail', 'User is already a super admin');
    user.roles?.push(Roles.SUPER_ADMIN.type);
    const existingRestrictions = user.restrictions;
    user.authorities = Roles.SUPER_ADMIN.authorities;
    user.restrictions = Array.from(
      new Set([...Roles.SUPER_ADMIN.restrictions, ...existingRestrictions])
    );
    await user.save();
    res.status(200).json({
      status: 'success',
      message: 'User is now a super admin',
    });
  } catch (err) {
    next(err);
  }
};
exports.removeSuperAdmin = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const Roles = await role.getRoles();
    const user = await userModel.findById(userId);
    if (!user) throw new AppError(404, 'fail', 'No user found with this id');
    if (req.user._id?.toString() === userId?.toString())
      throw new AppError(
        400,
        'fail',
        'You cannot remove yourself as a super admin'
      );
    if (!user.roles?.includes(Roles.SUPER_ADMIN.type))
      throw new AppError(400, 'fail', 'User is not a super admin');
    user.roles = user.roles.filter((role) => role !== Roles.SUPER_ADMIN.type);
    user.authorities = Roles.ADMIN.authorities;
    user.restrictions = Roles.ADMIN.restrictions;
    await user.save();
    res.status(200).json({
      status: 'success',
      message: 'User is no longer a super admin',
    });
  } catch (err) {
    next(err);
  }
};
exports.authorizeOrRestrict = async (req, res, next) => {
  try {
    const { authorities, restrictions } = req.body;
    const { userId } = req.params;
    if (!validateActions(authorities))
      throw new AppError(
        400,
        'fail',
        'One or many actions are invalid in the authorities array'
      );
    if (!validateActions(restrictions))
      throw new AppError(
        400,
        'fail',
        'One or many actions are invalid in the restrictions array'
      );
    if (req.user._id?.toString() === userId?.toString())
      throw new AppError(
        400,
        'fail',
        'You cannot change your own authorities or restrictions'
      );
    const user = await userModel.findById(userId);
    if (!user) throw new AppError(404, 'fail', 'No user found with this id');
    const existingAuthorities = user.authorities;
    const existingRestrictions = user.restrictions;
    user.authorities = Array.from(
      new Set([...authorities, ...existingAuthorities])
    );
    user.restrictions = Array.from(
      new Set([...restrictions, ...existingRestrictions])
    );
    await user.save();
    res.status(200).json({
      status: 'success',
      message: 'User authorities and restrictions updated',
    });
  } catch (err) {
    next(err);
  }
};
exports.banUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const Roles = await role.getRoles();
    const user = await userModel.findById(userId);
    if (!user) throw new AppError(404, 'fail', 'No user found with this id');
    if (req.user._id?.toString() === userId?.toString())
      throw new AppError(400, 'fail', 'You cannot ban yourself');
    if (user.accessRestricted)
      throw new AppError(400, 'fail', 'User is already banned');
    if (user.roles?.includes(Roles.SUPER_ADMIN.type))
      throw new AppError(400, 'fail', 'You cannot ban a super admin');
    if (user.roles?.includes(Roles.ADMIN.type))
      throw new AppError(400, 'fail', 'You cannot ban an admin');
    user.accessRestricted = true;
    await user.save();
    res.status(200).json({
      status: 'success',
      message: 'User is now banned',
    });
  } catch (err) {
    next(err);
  }
};
exports.unbanUser = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const user = await userModel.findById(userId);
    if (!user) throw new AppError(404, 'fail', 'No user found with this id');
    if (req.user._id?.toString() === userId?.toString())
      throw new AppError(400, 'fail', 'You cannot unban yourself');
    if (!user.accessRestricted)
      throw new AppError(400, 'fail', 'User is not banned');
    user.accessRestricted = false;
    await user.save();
    res.status(200).json({
      status: 'success',
      message: 'User is now unbanned',
    });
  } catch (err) {
    next(err);
  }
};
exports.createRole = async (req, res, next) => {
  const { name, authorities, restrictions } = req.body;
  try {
    if (await role.getRoleByName(name))
      throw new AppError(400, 'fail', 'Role already exists');
    const createdRole = await role.createRole(name, authorities, restrictions);
    res.status(201).json({
      status: 'success',
      message: 'Role created',
      data: createdRole,
    });
  } catch (err) {
    next(err);
  }
};
exports.getRoles = async (req, res, next) => {
  try {
    const roles = await role.getRoles();
    res.status(200).json({
      status: 'success',
      message: 'Roles retrieved',
      data: roles,
    });
  } catch (err) {
    next(err);
  }
};
exports.getRole = async (req, res, next) => {
  const { name } = req.params;
  try {
    const singleRole = await role.getRoleByName(name);
    res.status(200).json({
      status: 'success',
      message: 'Role retrieved',
      data: singleRole,
    });
  } catch (err) {
    next(err);
  }
};
exports.deleteRole = async (req, res, next) => {
  const { name } = req.params;
  try {
    const deletedRole = await role.deleteRoleByName(name);
    res.status(200).json({
      status: 'success',
      message: 'Role deleted',
      data: deletedRole,
    });
  } catch (err) {
    next(err);
  }
};
exports.updateRole = async (req, res, next) => {
  const { name } = req.params;
  const { authorities, restrictions } = req.body;
  try {
    const updatedRole = await role.updateRoleByName(
      name,
      authorities,
      restrictions
    );
    res.status(200).json({
      status: 'success',
      message: 'Role updated',
      data: updatedRole,
    });
  } catch (err) {
    next(err);
  }
};
