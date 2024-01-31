import { IReq } from '@interfaces/vendors';
import USER from '@models/user/user_model';
import Role from '@utils/authorization/roles/role';
import AppError from '@utils/app_error';
import { Controller, Res, Route, Security, Tags, TsoaResponse } from 'tsoa';
import {
    Response,
    Path,
    SuccessResponse,
    Put,
    Example,
    Request,
} from '@tsoa/runtime';
import { InspectAuthority } from '@root/decorators/inspect_authority';
import Actions from '@constants/actions';

@Security('jwt')
@Route('super-admin')
@Tags('Super Admin')
export class SuperAdminController extends Controller {
    @Example({
        message: 'User is now an admin',
    })
    @Response(404, 'No user found with this id')
    @Response(500, 'Error in base roles, please contact an admin')
    @Response(400, 'User is already an admin')
    @SuccessResponse('200', 'OK')
    @InspectAuthority(Actions.UPDATE_USER)
    @Put('add-admin/{userId}')
    async addAdmin(
        @Res() res: TsoaResponse<200, any>,
        @Path() userId: string
    ): Promise<{ message: string }> {
        const Roles = await Role.getRoles();
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
        return res(200, {
            message: 'User is now an admin',
        });
    }

    @Example({ message: 'User is no longer an admin' })
    @Response(
        400,
        `- You cannot remove yourself as an admin.
         \n- User is not an admin.
    `
    )
    @Response(500, 'Error in base roles, please contact an admin')
    @Response(404, 'No user found with this id')
    @SuccessResponse('200', 'OK')
    @InspectAuthority(Actions.UPDATE_USER)
    @Put('remove-admin/{userId}')
    async removeAdmin(
        @Res() res: TsoaResponse<200, any>,
        @Path() userId: string,
        @Request() req: IReq
    ): Promise<{ message: string }> {
        const Roles = await Role.getRoles();
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
        return res(200, {
            message: 'User is no longer an admin',
        });
    }

    @Example({ message: 'User is now a super admin' })
    @Response(
        400,
        `- You cannot make yourself a super admin.
         \n- User is already a super admin`
    )
    @Response(404, 'No user found with this id')
    @SuccessResponse('200', 'OK')
    @InspectAuthority(Actions.UPDATE_USER)
    @Put('add-super-admin/{userId}')
    async addSuperAdmin(
        @Res() res: TsoaResponse<200, any>,
        @Path() userId: string,
        @Request() req: IReq
    ) {
        const Roles = await Role.getRoles();
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
        return res(200, {
            message: 'User is now a super admin',
        });
    }

    @Example({ message: 'User is no longer a super admin' })
    @Response(
        400,
        `- You cannot remove yourself as a super admin.
         \n- User is not a super admin.`
    )
    @Response(404, 'No user found with this id')
    @SuccessResponse('200', 'OK')
    @InspectAuthority(Actions.UPDATE_USER)
    @Put('remove-super-admin/{userId}')
    async removeSuperAdmin(
        @Res() res: TsoaResponse<200, any>,
        @Path() userId: string,
        @Request() req: IReq
    ) {
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
        return res(200, {
            message: 'User is no longer a super admin',
        });
    }
}
