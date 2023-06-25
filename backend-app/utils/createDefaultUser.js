// create admin user if not exists

const User = require('../models/userModel');
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require('../config/appConfig');

const createAdminUser = async () => {
  try {
    const user = await User.findOne({ email: ADMIN_EMAIL });
    if (!user) {
      await User.create({
        name: 'Supper Admin',
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        roles: ['SUPER_ADMIN'],
      });
      console.log("Default admin user created successfully");
    }
  } catch (err) {
    Logger.error(err);
  }
};

module.exports = createAdminUser

