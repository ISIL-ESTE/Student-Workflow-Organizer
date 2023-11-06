import AppError from '@utils/app_error';
import roleModel from '@models/user/role_model';
import Actions from '@constants/actions';

interface RoleData {
    name: string;
    authorities: string[];
    restrictions: string[];
}

function isRoleName(roleName: any): void {
    if (!roleName || typeof roleName !== 'string')
        throw new AppError(400, 'Invalid role name!');
}

/**
 * Get all roles from database.
 */
async function getRoles(): Promise<{ [key: string]: RoleData }> {
    const data: { [key: string]: RoleData } = {};
    const roles = await roleModel.find();

    roles.forEach((role) => {
        data[role.name] = {
            name: role.name,
            authorities: role.authorities,
            restrictions: role.restrictions,
        };
    });
    return data;
}

/**
 * Get role by name from database.
 * @param {string} roleName
 * @returns {Promise<RoleData>}
 */
async function getRoleByName(roleName: string): Promise<RoleData | null> {
    isRoleName(roleName);
    const role = await roleModel.findOne({ name: roleName });
    if (!role) return null;
    return {
        name: role.name,
        authorities: role.authorities,
        restrictions: role.restrictions,
    };
}

/**
 * Delete role by name from database.
 * @param {string} roleName
 * @returns {Promise<RoleData>}
 */
async function deleteRoleByName(roleName: string): Promise<RoleData> {
    isRoleName(roleName);
    const role = await getRoleByName(roleName);
    if (!role) throw new AppError(404, 'Role not found!');
    const deletedRole = await roleModel.findOneAndDelete(
        { name: roleName },
        { new: true }
    );
    if (!deletedRole) throw new AppError(404, 'Role not found!');
    return {
        name: deletedRole.name,
        authorities: deletedRole.authorities,
        restrictions: deletedRole.restrictions,
    };
}

/**
 * Create role by name from database.
 * @param {string} roleName
 * @param {string[]} authorities
 * @param {string[]} restrictions
 * @returns {Promise<RoleData>}
 */
async function createRole(
    roleName: string,
    authorities: string[] = [],
    restrictions: string[] = []
): Promise<RoleData> {
    isRoleName(roleName);
    if (await getRoleByName(roleName))
        throw new AppError(400, 'Role already exists');
    authorities.forEach((authority) => {
        if (!Object.values(Actions).includes(authority))
            throw new AppError(400, `Invalid authority ${authority}`);
    });
    restrictions.forEach((restriction) => {
        if (!Object.values(Actions).includes(restriction))
            throw new AppError(400, `Invalid restriction ${restriction}`);
    });
    const role = await roleModel.create({
        name: roleName,
        authorities,
        restrictions,
    });
    return {
        name: role.name,
        authorities: role.authorities,
        restrictions: role.restrictions,
    };
}

/**
 * Delete default roles from database.
 */
async function deleteDefaultRoles(): Promise<void> {
    await roleModel.deleteMany({
        name: { $in: ['SUPER_ADMIN', 'ADMIN', 'USER'] },
    });
}

/**
 *
 * @param {string} roleName
 * @param {string[]} authorities
 * @param {string[]} restrictions
 */
async function updateRoleByName(
    roleName: string,
    authorities: string[] = [],
    restrictions: string[] = []
): Promise<RoleData> {
    authorities.forEach((authority) => {
        if (!Object.values(Actions).includes(authority))
            throw new AppError(400, `Invalid authority ${authority}`);
    });
    restrictions.forEach((restriction) => {
        if (!Object.values(Actions).includes(restriction))
            throw new AppError(400, `Invalid restriction ${restriction}`);
    });
    const exists = await getRoleByName(roleName);
    if (!exists) throw new AppError(404, 'Role does not exist');

    const updatedRole = await roleModel.findOneAndUpdate(
        {
            name: roleName,
        },
        {
            authorities: Array.from(
                new Set([...exists.authorities, ...authorities])
            ),
            restrictions: Array.from(
                new Set([...exists.restrictions, ...restrictions])
            ),
        }
    );
    if (!updatedRole) throw new AppError(404, 'Role not found!');
    return {
        name: updatedRole.name,
        authorities: updatedRole.authorities,
        restrictions: updatedRole.restrictions,
    };
}

export default {
    getRoles,
    getRoleByName,
    deleteRoleByName,
    createRole,
    deleteDefaultRoles,
    updateRoleByName,
};
