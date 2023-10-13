/* eslint-disable no-warning-comments */
import { IReq } from '@interfaces/vendors';
import USER from '@models/user/user_model';
import Role from '@utils/authorization/roles/role';
import AppError from '@utils/app_error';
import validateActions from '@utils/authorization/validate_actions';
import { Controller, Delete, Get, Post, Route } from 'tsoa';
import {
    Response,
    SuccessResponse,
    Middlewares,
    Put,
    Example,
    Request,
} from '@tsoa/runtime';
import Actions from '@constants/actions';
import restrictTo from '@middlewares/authorization';

//TODO:  set path in params
//TODO: set types and interfaces to all the methods

@Route('admin')
export class AdminController extends Controller {
    @Example({
        message: 'User is now an admin',
    })
    @Response(400, 'User is a super admin')
    @Response(404, 'No user found with this id')
    @Response(400, 'You cannot change your own authorities or restrictions')
    @Response(400, 'One or many actions are invalid in the restrictions array')
    @Response(400, 'One or many actions are invalid in the authorities array')
    @SuccessResponse('200', 'OK')
    @Middlewares(restrictTo(Actions.UPDATE_USER))
    @Put('authorize-or-restrict/{userId}')
    async authorizeOrRestrict(@Request() req: IReq) {
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
        this.setStatus(200);
        return {
            message: 'User authorities and restrictions updated',
        };
    }

    //ban user
    @Example({
        message: 'User is now banned',
    })
    @Response(400, 'You cannot ban an admin')
    @Response(400, 'You cannot ban a super admin')
    @Response(400, 'User is already banned')
    @Response(400, 'You cannot ban yourself')
    @SuccessResponse('200', 'OK')
    @Middlewares(restrictTo(Actions.UPDATE_USER, Actions.BAN_USER))
    @Put('ban-user/{userId}')
    async banUser(@Request() req: IReq) {
        const { userId } = req.params;

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
        this.setStatus(200);
        return {
            message: 'User is now banned',
        };
    }
    //unban user
    @Example({
        message: 'User is now unbanned',
    })
    @Response(400, 'User is not banned')
    @Response(400, 'You cannot unban yourself')
    @Response(404, 'No user found with this id')
    @SuccessResponse('200', 'OK')
    @Middlewares(restrictTo(Actions.UPDATE_USER, Actions.BAN_USER))
    @Put('unban-user/{userId}')
    async unbanUser(@Request() req: IReq) {
        const { userId } = req.params;
        const user = await USER.findById(userId);
        if (!user) throw new AppError(404, 'No user found with this id');
        if (req.user._id?.toString() === userId?.toString())
            throw new AppError(400, 'You cannot unban yourself');
        if (!user.accessRestricted)
            throw new AppError(400, 'User is not banned');
        user.accessRestricted = false;
        await user.save();
        this.setStatus(200);
        return {
            message: 'User is now unbanned',
        };
    }

    //create role
    @Example({
        message: 'Role created',
        data: {},
    })
    @Response(400, 'Role already exists')
    @SuccessResponse('201', 'CREATED')
    @Middlewares(restrictTo(Actions.MANAGE_ROLES))
    @Post('role')
    async createRole(@Request() req: IReq) {
        const { name, authorities, restrictions } = req.body;

        if (await Role.getRoleByName(name))
            throw new AppError(400, 'Role already exists');
        const createdRole = await Role.createRole(
            name,
            authorities,
            restrictions
        );
        this.setStatus(201);
        return {
            message: 'Role created',
            data: createdRole,
        };
    }
    //get roles
    @Example({
        message: 'Roles retrieved',
        data: [],
    })
    @SuccessResponse('200', 'OK')
    @Middlewares(restrictTo(Actions.MANAGE_ROLES))
    @Get('role')
    async getRoles() {
        const roles = await Role.getRoles();
        this.setStatus(200);
        return {
            message: 'Roles retrieved',
            data: roles,
        };
    }

    @Example({
        message: 'Role retrieved',
        data: {},
    })
    @SuccessResponse('200', 'OK')
    @Middlewares(restrictTo(Actions.MANAGE_ROLES))
    @Get('role/{name}')
    async getRole(@Request() req: IReq) {
        const { name } = req.params;
        const singleRole = await Role.getRoleByName(name as string);
        this.setStatus(200);
        return {
            message: 'Role retrieved',
            data: singleRole,
        };
    }

    //TODO:need to talk about it
    @Example({
        message: 'Role deleted',
        data: {},
    })
    @SuccessResponse('200', 'OK')
    @Middlewares(restrictTo(Actions.MANAGE_ROLES))
    @Delete('role/{name}')
    async deleteRole(@Request() req: IReq) {
        const { name } = req.params;
        const deletedRole = await Role.deleteRoleByName(name as string);
        this.setStatus(200);
        return {
            message: 'Role deleted',
            data: deletedRole,
        };
    }
    @Example({
        message: 'Role updated',
        data: {},
    })
    @SuccessResponse('200', 'OK')
    @Middlewares(restrictTo(Actions.MANAGE_ROLES))
    @Put('role/{name}')
    async updateRole(@Request() req: IReq) {
        const { name } = req.params;
        const { authorities, restrictions } = req.body;
        const updatedRole = await Role.updateRoleByName(
            name as string,
            authorities,
            restrictions
        );
        this.setStatus(200);
        return {
            message: 'Role updated',
            data: updatedRole,
        };
    }
    @Example({
        message: 'Role assigned to user',
    })
    @SuccessResponse('200', 'OK')
    @Middlewares(restrictTo(Actions.MANAGE_ROLES))
    @Put('assign-role/{name}/{userId}')
    async assignRoleToUser(@Request() req: IReq) {
        const { userId, name } = req.params;
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
        this.setStatus(200);
        return {
            message: 'Role assigned to user',
        };
    }

    @Example({
        message: 'Role removed to user',
    })
    @Response(400, 'User does not have this role')
    @Response(404, 'No user found with this id')
    @Response(404, 'No role found with this name')
    @SuccessResponse('200', 'OK')
    @Middlewares(restrictTo(Actions.MANAGE_ROLES))
    @Put('remove-role/{name}/{userId}')
    async removeRoleFromUser(@Request() req: IReq) {
        const { userId, name } = req.params;
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
        return {
            message: 'Role removed from user',
        };
    }
}
