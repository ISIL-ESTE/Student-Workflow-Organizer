import { IReq, IRes, INext } from '@interfaces/vendors';
import USER from '@models/user/user_model';
import Role from '@utils/authorization/roles/role';
import AppError from '@utils/app_error';
import validateActions from '@utils/authorization/validate_actions';

export const addAdmin = async (req: IReq, res: IRes, next: INext) => {
    try {
        const Roles = await Role.getRoles();
        const { userId } = req.params;
        const user = await USER.findById(userId);
        if (!user) throw new AppError(404, 'No user found with this id');
        if (!Roles.ADMIN)
            throw new AppError(
                500,
                'Error in base roles, please contact an admin'
            );
        if (user.roles?.includes(Roles.ADMIN.name))
            throw new AppError(400, 'User is already an admin');
        user.roles?.push(Roles.ADMIN.name);
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
            message: 'User is now an admin',
        });
    } catch (err) {
        next(err);
    }
};

export const removeAdmin = async (req: IReq, res: IRes, next: INext) => {
    try {
        const Roles = await Role.getRoles();
        const { userId } = req.params;
        const user = await USER.findById(userId);
        if (!user) throw new AppError(404, 'No user found with this id');
        if (!Roles.ADMIN || !Roles.USER)
            throw new AppError(
                500,
                'Error in base roles, please contact an admin'
            );
        if (req.user._id?.toString() === userId?.toString())
            throw new AppError(400, 'You cannot remove yourself as an admin');
        if (!user.roles?.includes(Roles.ADMIN.name))
            throw new AppError(400, 'User is not an admin');
        user.roles = user.roles.filter((role) => role !== Roles.ADMIN.name);
        user.authorities = Roles.USER.authorities;
        user.restrictions = Roles.USER.restrictions;
        await user.save();
        res.status(200).json({
            message: 'User is no longer an admin',
        });
    } catch (err) {
        next(err);
    }
};

export const addSuperAdmin = async (req: IReq, res: IRes, next: INext) => {
    try {
        const Roles = await Role.getRoles();
        const { userId } = req.params;
        const user = await USER.findById(userId);
        if (!user) throw new AppError(404, 'No user found with this id');
        if (req.user._id?.toString() === userId?.toString())
            throw new AppError(400, 'You cannot make yourself a super admin');
        if (user.roles?.includes(Roles.SUPER_ADMIN.name))
            throw new AppError(400, 'User is already a super admin');
        user.roles?.push(Roles.SUPER_ADMIN.name);
        const existingRestrictions = user.restrictions;
        user.authorities = Roles.SUPER_ADMIN.authorities;
        user.restrictions = Array.from(
            new Set([
                ...Roles.SUPER_ADMIN.restrictions,
                ...existingRestrictions,
            ])
        );
        await user.save();
        res.status(200).json({
            message: 'User is now a super admin',
        });
    } catch (err) {
        next(err);
    }
};

export const removeSuperAdmin = async (req: IReq, res: IRes, next: INext) => {
    const { userId } = req.params;
    try {
        const Roles = await Role.getRoles();
        const user = await USER.findById(userId);
        if (!user) throw new AppError(404, 'No user found with this id');
        if (req.user._id?.toString() === userId?.toString())
            throw new AppError(
                400,
                'You cannot remove yourself as a super admin'
            );
        if (!user.roles?.includes(Roles.SUPER_ADMIN.name))
            throw new AppError(400, 'User is not a super admin');
        user.roles = user.roles.filter(
            (role) => role !== Roles.SUPER_ADMIN.name
        );
        user.authorities = Roles.ADMIN.authorities;
        user.restrictions = Roles.ADMIN.restrictions;
        await user.save();
        res.status(200).json({
            message: 'User is no longer a super admin',
        });
    } catch (err) {
        next(err);
    }
};

export const authorizeOrRestrict = async (
    req: IReq,
    res: IRes,
    next: INext
) => {
    try {
        const { authorities, restrictions } = req.body;
        const { userId } = req.params;
        if (!validateActions(authorities))
            throw new AppError(
                400,
                'One or many actions are invalid in the authorities array'
            );
        if (!validateActions(restrictions))
            throw new AppError(
                400,
                'One or many actions are invalid in the restrictions array'
            );
        if (req.user._id?.toString() === userId?.toString())
            throw new AppError(
                400,
                'You cannot change your own authorities or restrictions'
            );
        const user = await USER.findById(userId);
        if (!user) throw new AppError(404, 'No user found with this id');
        // if the user is a super admin, he can't be restricted
        if (user.roles?.includes('SUPER_ADMIN'))
            throw new AppError(400, 'User is a super admin');
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
            message: 'User authorities and restrictions updated',
        });
    } catch (err) {
        next(err);
    }
};

export const banUser = async (req: IReq, res: IRes, next: INext) => {
    const { userId } = req.params;
    try {
        const Roles = await Role.getRoles();
        const user = await USER.findById(userId);
        if (!user) throw new AppError(404, 'No user found with this id');
        if (req.user._id?.toString() === userId?.toString())
            throw new AppError(400, 'You cannot ban yourself');
        if (user.accessRestricted)
            throw new AppError(400, 'User is already banned');
        if (user.roles?.includes(Roles.SUPER_ADMIN.name))
            throw new AppError(400, 'You cannot ban a super admin');
        if (user.roles?.includes(Roles.ADMIN.name))
            throw new AppError(400, 'You cannot ban an admin');
        user.accessRestricted = true;
        await user.save();
        res.status(200).json({
            message: 'User is now banned',
        });
    } catch (err) {
        next(err);
    }
};

export const unbanUser = async (req: IReq, res: IRes, next: INext) => {
    const { userId } = req.params;
    try {
        const user = await USER.findById(userId);
        if (!user) throw new AppError(404, 'No user found with this id');
        if (req.user._id?.toString() === userId?.toString())
            throw new AppError(400, 'You cannot unban yourself');
        if (!user.accessRestricted)
            throw new AppError(400, 'User is not banned');
        user.accessRestricted = false;
        await user.save();
        res.status(200).json({
            message: 'User is now unbanned',
        });
    } catch (err) {
        next(err);
    }
};

export const createRole = async (req: IReq, res: IRes, next: INext) => {
    const { name, authorities, restrictions } = req.body;
    try {
        if (await Role.getRoleByName(name))
            throw new AppError(400, 'Role already exists');
        const createdRole = await Role.createRole(
            name,
            authorities,
            restrictions
        );
        res.status(201).json({
            message: 'Role created',
            data: createdRole,
        });
    } catch (err) {
        next(err);
    }
};

export const getRoles = async (_req: IReq, res: IRes, next: INext) => {
    try {
        const roles = await Role.getRoles();
        res.status(200).json({
            message: 'Roles retrieved',
            data: roles,
        });
    } catch (err) {
        next(err);
    }
};

export const getRole = async (req: IReq, res: IRes, next: INext) => {
    const { name } = req.params;
    try {
        const singleRole = await Role.getRoleByName(name as string);
        res.status(200).json({
            message: 'Role retrieved',
            data: singleRole,
        });
    } catch (err) {
        next(err);
    }
};

export const deleteRole = async (req: IReq, res: IRes, next: INext) => {
    const { name } = req.params;
    try {
        const deletedRole = await Role.deleteRoleByName(name as string);
        res.status(200).json({
            message: 'Role deleted',
            data: deletedRole,
        });
    } catch (err) {
        next(err);
    }
};

export const updateRole = async (req: IReq, res: IRes, next: INext) => {
    const { name } = req.params;
    const { authorities, restrictions } = req.body;
    try {
        const updatedRole = await Role.updateRoleByName(
            name as string,
            authorities,
            restrictions
        );
        res.status(200).json({
            message: 'Role updated',
            data: updatedRole,
        });
    } catch (err) {
        next(err);
    }
};

export const assignRoleToUser = async (req: IReq, res: IRes, next: INext) => {
    const { userId, name } = req.params;
    try {
        const user = await USER.findById(userId);
        const role = await Role.getRoleByName(name as string);
        if (!user) throw new AppError(404, 'No user found with this id');
        if (!role) throw new AppError(404, 'No role found with this name');
        if (user.roles.includes(role.name))
            throw new AppError(400, 'User already has this role');
        user.roles.push(role.name);
        user.authorities = Array.from(
            new Set([...role.authorities, ...user.authorities])
        );
        user.restrictions = Array.from(
            new Set([...role.restrictions, ...user.restrictions])
        );
        await user.save();
        res.status(200).json({
            message: 'Role assigned to user',
        });
    } catch (err) {
        next(err);
    }
};

export const removeRoleFromUser = async (req: IReq, res: IRes, next: INext) => {
    const { userId, name } = req.params;
    try {
        const role = await Role.getRoleByName(name as string);
        if (!role) throw new AppError(404, 'No role found with this name');
        const user = await USER.findById(userId);
        if (!user) throw new AppError(404, 'No user found with this id');
        if (!user.roles.includes(role.name))
            throw new AppError(400, 'User does not have this role');
        user.roles = user.roles.filter((_role) => _role !== role.name);
        user.authorities = user.authorities.filter(
            (authority) => !role.authorities.includes(authority)
        );
        user.restrictions = user.restrictions.filter(
            (restriction) => !role.restrictions.includes(restriction)
        );
        await user.save();
        res.status(200).json({
            message: 'Role removed from user',
        });
    } catch (err) {
        next(err);
    }
};
