const userModel = require('../models/userModel');
const { Actions } = require('../middlewares/authorization');
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
    authorities.forEach((authority) => {
      if (!Object.values(Actions).includes(authority))
        throw new AppError(400, 'fail', `Invalid authority: ${authority}`);
    });
    restrictions.forEach((restriction) => {
      if (!Object.values(Actions).includes(restriction))
        throw new AppError(400, `fail', 'Invalid restriction: ${restriction}`);
    });
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
