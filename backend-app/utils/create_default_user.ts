// create admin user if not exists

import User from '../models/user/user_model';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../config/app_config';
import { SUPER_ADMIN } from '../constants/default_roles';

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
        Logger.error(err.stack);
    }
};

export default createAdminUser;
