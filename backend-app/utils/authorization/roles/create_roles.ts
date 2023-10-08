import Actions from '../../../constants/actions';
import Role from './role';
import logger from '@utils/logger';

interface RoleType {
    type: string;
    authorities: string[];
    restrictions: string[];
}

const superAdmin: RoleType = {
    type: 'SUPER_ADMIN',
    authorities: Object.values(Actions),
    restrictions: [],
};
const admin: RoleType = {
    type: 'ADMIN',
    authorities: [Actions.BAN_USER, Actions.DELETE_USER],
    restrictions: [],
};
const user: RoleType = {
    type: 'USER',
    authorities: [Actions.UPDATE_CALANDER],
    restrictions: [],
};

const createRoles = async (): Promise<void> => {
    const roles = await Role.getRoles();
    const roleArr = Object.keys(roles);
    try {
        if (
            roleArr.length > 2 &&
            roleArr.includes(superAdmin.type) &&
            roleArr.includes(admin.type) &&
            roleArr.includes(user.type)
        )
            return;
        await Role.createRole(
            superAdmin.type,
            superAdmin.authorities,
            superAdmin.restrictions
        );
        await Role.createRole(
            admin.type,
            admin.authorities,
            admin.restrictions
        );
        await Role.createRole(user.type, user.authorities, user.restrictions);
        logger.info(
            `[ ${superAdmin.type}, ${admin.type}, ${user.type} ] ROLES CREATED!`
        );
        // logger.warn(await role.getRoles());
    } catch (err) {
        logger.error(err.stack);
    }
};
export default createRoles;
