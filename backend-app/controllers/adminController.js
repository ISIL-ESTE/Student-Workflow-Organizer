const userModel = require('../models/userModel');
const { Roles, Actions } = require('../middlewares/authorization');
const AppError = require('../utils/appError');

exports.addAdmin = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await userModel.findById(userId);
    if (!user) throw new AppError(404, 'fail', 'No user found with this id');
    if (user.role === Roles.ADMIN)
      throw new AppError(400, 'fail', 'User is already an admin');
    user.role = Roles.ADMIN.type;
    user.authorities = Roles[user.role].authorities;
    user.restrictions = Roles[user.role].restrictions;
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
  const { userId } = req.params;
  const user = await userModel.findById(userId);
  if (!user) throw new AppError(404, 'fail', 'No user found with this id');
  if (user.role === Roles.USER)
    throw new AppError(400, 'fail', 'User is not an admin');
  user.role = Roles.USER.type;
  user.authorities = Roles[user.role].authorities;
  user.restrictions = Roles[user.role].restrictions;
  await user.save();
  res.status(200).json({
    status: 'success',
    message: 'User is no longer an admin',
  });
};

exports.addSuperAdmin = async (req, res, next) => {
  const { userId } = req.params;
  const user = await userModel.findById(userId);
  if (!user) throw new AppError(404, 'fail', 'No user found with this id');
  if (user.role === Roles.SUPER_ADMIN)
    throw new AppError(400, 'fail', 'User is already a super admin');
  user.role = Roles.SUPER_ADMIN.type;
  user.authorities = Roles[user.role].authorities;
  user.restrictions = Roles[user.role].restrictions;
  await user.save();
  res.status(200).json({
    status: 'success',
    message: 'User is now a super admin',
  });
};

exports.authorizeOrRestrict = async (req, res, next) => {
  const { authorities, restrictions } = req.body;
  const { userId } = req.params;
  authorities.forEach((authority) => {
    if (!Object.values(Actions).includes(authority))
      throw new AppError(400, 'fail', 'Invalid authority');
  });
  restrictions.forEach((restriction) => {
    if (!Object.values(Actions).includes(restriction))
      throw new AppError(400, 'fail', 'Invalid restriction');
  });
  const user = await userModel.findById(userId);
  if (!user) throw new AppError(404, 'fail', 'No user found with this id');
  user.authorities = authorities;
  user.restrictions = restrictions;
  await user.save();
  res.status(200).json({
    status: 'success',
  });
};
