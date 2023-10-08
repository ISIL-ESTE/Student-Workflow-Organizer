import User from '@models/user/user_model';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '@config/app_config';
import logger from '@utils/logger';
import Role from '@utils/authorization/roles/role';

const createAdminUser = async () => {
    try {
        const user = await User.findOne({ email: ADMIN_EMAIL });
        if (!user) {
            const roles = await Role.getRoles();
            await User.create({
                name: 'Supper Admin',
                email: ADMIN_EMAIL,
                password: ADMIN_PASSWORD,
                roles: [roles.SUPER_ADMIN.name],
                authorities: roles.SUPER_ADMIN.authorities,
                restrictions: roles.SUPER_ADMIN.restrictions,
                active: true,
            });
        }
    } catch (err) {
        logger.error(err.stack);
    }
};

export default createAdminUser;
