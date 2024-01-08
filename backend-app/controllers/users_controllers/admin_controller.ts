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
    Res,
    Route,
    Security,
    Tags,
    TsoaResponse,
} from 'tsoa';
import {
    Response,
    SuccessResponse,
    Put,
    Example,
    Request,
} from '@tsoa/runtime';
import Actions from '@constants/actions';
import { InspectAuthority } from '@root/decorators/inspect_authority';

interface RoleType {
    name: string;
    authorities: string[];
    restrictions: string[];
}
@Security('jwt')
@Route('admin')
@Tags('Admin')
export class AdminController extends Controller {
    @Example({
        message: 'User is now an admin',
    })
    @Response(
        400,
        `- One or many actions are invalid in the authorities array.
         \n- One or many actions are invalid in the restrictions array.
         \n- You cannot change your own authorities or restrictions.
         \n- No user found with this id.
         \n- User is a super admin.
         `
    )
    @SuccessResponse('200', 'OK')
    @InspectAuthority(Actions.UPDATE_USER)
    @Put('authorize-or-restrict/{userId}')
    async authorizeOrRestrict(
        @Path() userId: string,
        @Request() req: IReq,
        @Res() res: TsoaResponse<200, any>,
        @Body()
        body: Omit<RoleType, 'name'>
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
        return res(200, {
            message: 'User authorities and restrictions updated',
        });
    }

    @Example({
        message: 'User is now banned',
    })
    @Response(
        400,
        `
         - You cannot ban yourself.
         \n- User is already banned.
         \n- You cannot ban a super admin.
         \n- You cannot ban an admin`
    )
    @Response(404, ' No user found with this id')
    @SuccessResponse('200', 'OK')
    @InspectAuthority(Actions.UPDATE_USER, Actions.BAN_USER)
    @Put('ban-user/{userId}')
    async banUser(
        @Request() req: IReq,
        @Res() res: TsoaResponse<200, any>,
        @Path() userId: string
    ) {
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
        return res(200, {
            message: 'User is now banned',
        });
    }
    @Example({
        message: 'User is now unbanned',
    })
    @Response(
        400,
        `- You cannot unban yourself.
         \n- User is not banned.`
    )
    @Response(404, 'No user found with this id')
    @SuccessResponse('200', 'OK')
    @InspectAuthority(Actions.UPDATE_USER, Actions.BAN_USER)
    @Put('unban-user/{userId}')
    async unbanUser(
        @Request() req: IReq,
        @Res() res: TsoaResponse<200, any>,
        @Path() userId: string
    ) {
        const user = await USER.findById(userId);
        if (!user) throw new AppError(404, 'No user found with this id');
        if (req.user._id?.toString() === userId?.toString())
            throw new AppError(400, 'You cannot unban yourself');
        if (!user.accessRestricted)
            throw new AppError(400, 'User is not banned');
        user.accessRestricted = false;
        await user.save();
        return res(200, {
            message: 'User is now unbanned',
        });
    }

    @Response(400, 'Role already exists')
    @SuccessResponse('201', 'CREATED')
    @InspectAuthority(Actions.MANAGE_ROLES)
    @Post('role')
    async createRole(
        @Res() res: TsoaResponse<201, any>,

        @Body()
        body: RoleType
    ): Promise<{ message: string; data: RoleType }> {
        const { name, authorities, restrictions } = body;
        if (await Role.getRoleByName(name))
            throw new AppError(400, 'Role already exists');
        const createdRole = await Role.createRole(
            name,
            authorities,
            restrictions
        );
        return res(201, {
            message: 'Role created',
            data: createdRole,
        });
    }
    @SuccessResponse('200', 'OK')
    @InspectAuthority(Actions.MANAGE_ROLES)
    @Get('role')
    async getRoles(@Res() res: TsoaResponse<200, any>): Promise<{
        message: string;
        data: {
            [key: string]: RoleType;
        };
    }> {
        const roles = await Role.getRoles();
        return res(200, {
            message: 'Roles retrieved',
            data: roles,
        });
    }
    @SuccessResponse('200', 'OK')
    @InspectAuthority(Actions.MANAGE_ROLES)
    @Get('role/{name}')
    async getRole(
        @Res() res: TsoaResponse<200, any>,
        @Path() name: string
    ): Promise<{
        message: string;
        data: RoleType;
    }> {
        const singleRole = await Role.getRoleByName(name);
        return res(200, {
            message: 'Role retrieved',
            data: singleRole,
        });
    }
    @SuccessResponse('200', 'OK')
    @InspectAuthority(Actions.MANAGE_ROLES)
    @Delete('role/{name}')
    async deleteRole(
        @Res() res: TsoaResponse<200, any>,
        @Path() name: string
    ): Promise<{
        message: string;
        data: RoleType;
    }> {
        const deletedRole = await Role.deleteRoleByName(name);
        return res(200, {
            message: 'Role deleted',
            data: deletedRole,
        });
    }

    @SuccessResponse('200', 'OK')
    @InspectAuthority(Actions.MANAGE_ROLES)
    @Put('role/{name}')
    async updateRole(
        @Path() name: string,
        @Res() res: TsoaResponse<200, any>,
        @Body() body: Omit<RoleType, 'name'>
    ): Promise<{
        message: string;
        data: RoleType;
    }> {
        const { authorities, restrictions } = body;
        const updatedRole = await Role.updateRoleByName(
            name,
            authorities,
            restrictions
        );
        return res(200, {
            message: 'Role updated',
            data: updatedRole,
        });
    }
    @Example({
        message: 'Role assigned to user',
    })
    @Response(400, 'User already has this role')
    @Response(
        404,
        `- No user found with this id.
         \n- No role found with this name.`
    )
    @SuccessResponse('200', 'OK')
    @InspectAuthority(Actions.MANAGE_ROLES)
    @Put('assign-role/{name}/{userId}')
    async assignRoleToUser(
        @Res() res: TsoaResponse<200, any>,
        @Path() name: string,
        @Path() userId: string
    ) {
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
        return res(200, {
            message: 'Role assigned to user',
        });
    }
    @Example({
        message: 'Role removed to user',
    })
    @Response(400, 'User does not have this role')
    @Response(
        404,
        `- No role found with this name.
         \n- No user found with this id.`
    )
    @SuccessResponse('200', 'OK')
    @InspectAuthority(Actions.MANAGE_ROLES)
    @Put('remove-role/{name}/{userId}')
    async removeRoleFromUser(
        @Res() res: TsoaResponse<200, any>,
        @Path() name: string,
        @Path() userId: string
    ) {
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
        return res(200, {
            message: 'Role removed from user',
        });
    }
}
