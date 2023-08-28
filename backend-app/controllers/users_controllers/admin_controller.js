const userModel = require('../../models/user/user_model');
const Actions = require('../../constants/actions');
const validateActions = require('../../utils/authorization/validate_actions');
const Role = require('../../utils/authorization/role/role');
const AppError = require('../../utils/app_error');
const role = new Role();

exports.addAdmin = async (req, res, next) => {
    try {
        const Roles = await role.getRoles();
        const { userId } = req.params;
        const user = await userModel.findById(userId);
        if (!user)
            throw new AppError(404, 'fail', 'No user found with this id');
        if (req.user._id?.toString() === userId?.toString())
            throw new AppError(
                400,
                'fail',
                'You cannot make yourself an admin'
            );
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
        if (!user)
            throw new AppError(404, 'fail', 'No user found with this id');
        if (req.user._id?.toString() === userId?.toString())
            throw new AppError(
                400,
                'fail',
                'You cannot remove yourself as an admin'
            );
        if (!user.roles?.includes(Roles.ADMIN.type))
            throw new AppError(400, 'fail', 'User is not an admin');
        user.roles = user.roles.filter((role) => role !== Roles.ADMIN.type);
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

exports.addSuperAdmin = async (req, res, next) => {
    try {
        const Roles = await role.getRoles();
        const { userId } = req.params;
        const user = await userModel.findById(userId);
        if (!user)
            throw new AppError(404, 'fail', 'No user found with this id');
        if (req.user._id?.toString() === userId?.toString())
            throw new AppError(
                400,
                'fail',
                'You cannot make yourself a super admin'
            );
        if (user.roles?.includes(Roles.SUPER_ADMIN.type))
            throw new AppError(400, 'fail', 'User is already a super admin');
        user.roles?.push(Roles.SUPER_ADMIN.type);
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
exports.removeSuperAdmin = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const Roles = await role.getRoles();
        const user = await userModel.findById(userId);
        if (!user)
            throw new AppError(404, 'fail', 'No user found with this id');
        if (req.user._id?.toString() === userId?.toString())
            throw new AppError(
                400,
                'fail',
                'You cannot remove yourself as a super admin'
            );
        if (!user.roles?.includes(Roles.SUPER_ADMIN.type))
            throw new AppError(400, 'fail', 'User is not a super admin');
        user.roles = user.roles.filter(
            (role) => role !== Roles.SUPER_ADMIN.type
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
exports.authorizeOrRestrict = async (req, res, next) => {
    try {
        const { authorities, restrictions } = req.body;
        const { userId } = req.params;
        if (!validateActions(authorities))
            throw new AppError(
                400,
                'fail',
                'One or many actions are invalid in the authorities array'
            );
        if (!validateActions(restrictions))
            throw new AppError(
                400,
                'fail',
                'One or many actions are invalid in the restrictions array'
            );
        if (req.user._id?.toString() === userId?.toString())
            throw new AppError(
                400,
                'fail',
                'You cannot change your own authorities or restrictions'
            );
        const user = await userModel.findById(userId);
        if (!user)
            throw new AppError(404, 'fail', 'No user found with this id');
        // if the user is a super admin, he can't be restricted
        if (user.roles?.includes('SUPER_ADMIN'))
            throw new AppError(400, 'fail', 'User is a super admin');
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
exports.banUser = async (req, res, next) => {
    const { userId } = req.params;
    try {
        const Roles = await role.getRoles();
        const user = await userModel.findById(userId);
        if (!user)
            throw new AppError(404, 'fail', 'No user found with this id');
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
        if (!user)
            throw new AppError(404, 'fail', 'No user found with this id');
        if (req.user._id?.toString() === userId?.toString())
            throw new AppError(400, 'fail', 'You cannot unban yourself');
        if (!user.accessRestricted)
            throw new AppError(400, 'fail', 'User is not banned');
        user.accessRestricted = false;
        await user.save();
        res.status(200).json({
            message: 'User is now unbanned',
        });
    } catch (err) {
        next(err);
    }
};
exports.createRole = async (req, res, next) => {
    const { name, authorities, restrictions } = req.body;
    try {
        if (await role.getRoleByName(name))
            throw new AppError(400, 'fail', 'Role already exists');
        const createdRole = await role.createRole(
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
exports.getRoles = async (req, res, next) => {
    try {
        const roles = await role.getRoles();
        res.status(200).json({
            message: 'Roles retrieved',
            data: roles,
        });
    } catch (err) {
        next(err);
    }
};
exports.getRole = async (req, res, next) => {
    const { name } = req.params;
    try {
        const singleRole = await role.getRoleByName(name);
        res.status(200).json({
            message: 'Role retrieved',
            data: singleRole,
        });
    } catch (err) {
        next(err);
    }
};
exports.deleteRole = async (req, res, next) => {
    const { name } = req.params;
    try {
        const deletedRole = await role.deleteRoleByName(name);
        res.status(200).json({
            message: 'Role deleted',
            data: deletedRole,
        });
    } catch (err) {
        next(err);
    }
};
exports.updateRole = async (req, res, next) => {
    const { name } = req.params;
    const { authorities, restrictions } = req.body;
    try {
        const updatedRole = await role.updateRoleByName(
            name,
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
exports.assignRoleToUser = async (req, res, next) => {
    const { userId, name } = req.params;
    try {
        const user = await userModel.findById(userId);
        const Role = await role.getRoleByName(name);
        if (!user)
            throw new AppError(404, 'fail', 'No user found with this id');
        if (!Role)
            throw new AppError(404, 'fail', 'No role found with this name');
        if (user.roles.includes(Role.type))
            throw new AppError(400, 'fail', 'User already has this role');
        user.roles.push(Role.type);
        user.authorities = Array.from(
            new Set([...Role.authorities, ...user.authorities])
        );
        user.restrictions = Array.from(
            new Set([...Role.restrictions, ...user.restrictions])
        );
        await user.save();
        res.status(200).json({
            message: 'Role assigned to user',
        });
    } catch (err) {
        next(err);
    }
};
exports.removeRoleFromUser = async (req, res, next) => {
    const { userId, name } = req.params;
    try {
        const Role = await role.getRoleByName(name);
        if (!Role)
            throw new AppError(404, 'fail', 'No role found with this name');
        const user = await userModel.findById(userId);
        if (!user)
            throw new AppError(404, 'fail', 'No user found with this id');
        if (!user.roles.includes(Role.type))
            throw new AppError(400, 'fail', 'User does not have this role');
        user.roles = user.roles.filter((role) => role !== Role.type);
        user.authorities = user.authorities.filter(
            (authority) => !Role.authorities.includes(authority)
        );
        user.restrictions = user.restrictions.filter(
            (restriction) => !Role.restrictions.includes(restriction)
        );
        await user.save();
        res.status(200).json({
            message: 'Role removed from user',
        });
    } catch (err) {
        next(err);
    }
};
