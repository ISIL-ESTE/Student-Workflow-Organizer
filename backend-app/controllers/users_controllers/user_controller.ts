import { Controller, Get, Delete, Patch } from '@tsoa/runtime';
// import * as base from '@controllers/base_controller';
import AppError from '@utils/app_error';
import { IReq } from '@interfaces/vendors';
import {
    Request,
    Res,
    Route,
    Security,
    TsoaResponse,
    Response,
    SuccessResponse,
    Tags,
} from 'tsoa';
import User from '@root/models/user/user_model';

@Route('api/users')
@Security('jwt')
@Tags('User')
export class UserController extends Controller {
    @Response(401, 'Unauthorized')
    @SuccessResponse(200, 'OK')
    @Get('me')
    public getMe(@Request() req: IReq, @Res() res: TsoaResponse<200, any>) {
        if (!req.user) {
            throw new AppError(401, 'Please log in again!');
        }
        // return data of the current user
        res(200, req.user);
    }

    @Response(401, 'Unauthorized')
    @SuccessResponse(204, 'No Content')
    @Delete('me')
    public async deleteMe(
        @Request() req: IReq,
        @Res() res: TsoaResponse<204, { message: string }>
    ) {
        await User.findByIdAndUpdate(req.user._id, {
            deleted: true,
            deletedAt: Date.now(),
            deletedBy: req.user._id,
        });
        return res(204, { message: 'User deleted successfully' });
    }

    @Response(401, 'Unauthorized')
    @Response(
        400,
        `- This route is not for role updates. Please use /updateRole
         \n- This route is not for password updates. Please use auth/updateMyPassword`
    )
    @Response(404, '<b>No document found with that ID</b>')
    @SuccessResponse(200, 'OK')
    @Patch('me')
    public async updateMe(
        @Request() req: IReq,
        @Res() res: TsoaResponse<200, any>
    ) {
        // 1) Create error if user POSTs password data
        if (req.body.password || req.body.passwordConfirm) {
            throw new AppError(
                400,
                'This route is not for password updates. Please use api/password-management/update-password'
            );
        }
        // create error if user tries to update role
        if (req.body.roles) {
            throw new AppError(
                400,
                'This route is not for role updates. Please use /update-role'
            );
        }
        // 2) Filtered out unwanted fields names that are not allowed to be updated
        const payload = {
            name: req.body.name,
            email: req.body.email,
        };
        // TODO: the email should have a unique way to update
        // 3) Update user document
        const doc = await User.findByIdAndUpdate(req.user._id, payload, {
            new: true,
            runValidators: true,
        });
        if (!doc) {
            throw new AppError(404, 'No document found with that ID');
        }

        res(200, doc);
    }

    // @Get()
    // public async getAllUsers(): Promise<any> {
    //     return Promise.resolve(base.getAll(User));
    // }

    // @Get('{id}')
    // public async getUser(@Path() id: string): Promise<any> {
    //     return base.getOne(User, id);
    // }

    // @Put('{id}')
    // public async updateUser(id: string): Promise<void> {
    //     base.updateOne(User,id);
    // }

    // @Delete('{id}')
    // public async deleteUser(id: string): Promise<void> {
    //     base.deleteOne(User,id);
    // }
}
