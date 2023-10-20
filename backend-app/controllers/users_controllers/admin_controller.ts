/* eslint-disable no-warning-comments */
import { IReq } from '@interfaces/vendors';
import USER from '@models/user/user_model';
import Role from '@utils/authorization/roles/role';
import AppError from '@utils/app_error';
import validateActions from '@utils/authorization/validate_actions';
import {
    Body,
    Controller,
    Delete,
    Get,
    Path,
    Post,
    Route,
    Security,
} from 'tsoa';
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

interface roleCreationParams {
    name: string;
    authorities: string[];
    restrictions: string[];
}

//TODO:  set path in params
//TODO: set types and interfaces to all the methods
//TODO: need dtos

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
    @Security('jwt')
    @Middlewares(restrictTo(Actions.UPDATE_USER))
    @Put('authorize-or-restrict/{userId}')
    async authorizeOrRestrict(
        @Path() userId: string,
        @Request() req: IReq,
        @Body()
        body: {
            authorities: string[];
            restrictions: string[];
        }
    ) {
        const { authorities, restrictions } = body;
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

    //done
    @Response(400, 'Role already exists')
    @SuccessResponse('201', 'CREATED')
    @Middlewares(restrictTo(Actions.MANAGE_ROLES))
    @Security('jwt')
    @Post('role')
    async createRole(
        @Body()
        body: roleCreationParams
    ): Promise<{ message: string; data: roleCreationParams }> {
        const { name, authorities, restrictions } = body;
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
    //done
    @SuccessResponse('200', 'OK')
    @Middlewares(restrictTo(Actions.MANAGE_ROLES))
    @Security('jwt')
    @Get('role')
    async getRoles(): Promise<{
        message: string;
        data: {
            [key: string]: roleCreationParams;
        };
    }> {
        const roles = await Role.getRoles();
        this.setStatus(200);
        return {
            message: 'Roles retrieved',
            data: roles,
        };
    }
    //done
    @SuccessResponse('200', 'OK')
    @Middlewares(restrictTo(Actions.MANAGE_ROLES))
    @Security('jwt')
    @Get('role/{name}')
    async getRole(@Path() name: string): Promise<{
        message: string;
        data: roleCreationParams;
    }> {
        const singleRole = await Role.getRoleByName(name);
        this.setStatus(200);
        return {
            message: 'Role retrieved',
            data: singleRole,
        };
    }
    //done
    @SuccessResponse('200', 'OK')
    @Middlewares(restrictTo(Actions.MANAGE_ROLES))
    @Security('jwt')
    @Delete('role/{name}')
    async deleteRole(@Path() name: string): Promise<{
        message: string;
        data: roleCreationParams;
    }> {
        const deletedRole = await Role.deleteRoleByName(name);
        this.setStatus(200);
        return {
            message: 'Role deleted',
            data: deletedRole,
        };
    }

    //done
    @SuccessResponse('200', 'OK')
    @Middlewares(restrictTo(Actions.MANAGE_ROLES))
    @Security('jwt')
    @Put('role/{name}')
    async updateRole(
        @Path() name: string,
        @Body() body: Omit<roleCreationParams, 'name'>
    ): Promise<{
        message: string;
        data: roleCreationParams;
    }> {
        const { authorities, restrictions } = body;
        const updatedRole = await Role.updateRoleByName(
            name,
            authorities,
            restrictions
        );
        this.setStatus(200);
        return {
            message: 'Role updated',
            data: updatedRole,
        };
    }
    //done
    @Example({
        message: 'Role assigned to user',
    })
    @Response(400, 'User already has this role')
    @Response(404, 'No role found with this name')
    @Response(404, 'No user found with this id')
    @SuccessResponse('200', 'OK')
    @Middlewares(restrictTo(Actions.MANAGE_ROLES))
    @Security('jwt')
    @Put('assign-role/{name}/{userId}')
    async assignRoleToUser(@Path() name: string, @Path() userId: string) {
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
