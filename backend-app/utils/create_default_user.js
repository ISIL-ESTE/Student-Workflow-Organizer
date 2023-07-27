// create admin user if not exists

const User = require('../models/user_model');
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require('../config/app_config');
const { SUPER_ADMIN } = require('../constants/default_roles');

const createAdminUser = async () => {
    try {
        const user = await User.findOne({ email: ADMIN_EMAIL });
        if (!user) {
            await User.create({
                name: 'Supper Admin',
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                roles: [SUPER_ADMIN.type],
                authorities: SUPER_ADMIN.authorities,
                restrictions: SUPER_ADMIN.restrictions,
                active: true,
            });
        }
    } catch (err) {
        Logger.error(err);
    }
};

module.exports = createAdminUser;
