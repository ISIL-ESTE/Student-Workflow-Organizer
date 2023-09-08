import User from '../models/user/user_model';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../config/app_config';
import Roles from '@constants/default_roles';
import '@utils/logger';

const createAdminUser = async () => {
    try {
        const user = await User.findOne({ email: ADMIN_EMAIL });
        if (!user) {
            await User.create({
                name: 'Supper Admin',
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                // @ts-ignore
                roles: [Roles.SUPER_ADMIN.type],
                // @ts-ignore
                authorities: Roles.SUPER_ADMIN.authorities,
                // @ts-ignore
                restrictions: Roles.SUPER_ADMIN.restrictions,
                active: true,
            });
        }
    } catch (err) {
        Logger.error(err.stack);
    }
};

export default createAdminUser;
