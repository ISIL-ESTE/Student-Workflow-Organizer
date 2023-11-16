import mongoose from 'mongoose';
import { promisify } from 'util';
import AppError from '@utils/app_error';
import Role from '@utils/authorization/roles/role';
import { REQUIRE_ACTIVATION } from '@config/app_config';
import {
    getGithubOAuthUser,
    getGithubOAuthToken,
    getGithubOAuthUserPrimaryEmail,
} from '@utils/authorization/github';
import AuthUtils from '@utils/authorization/auth_utils';
import searchCookies from '@utils/searchCookie';
import User from '@models/user/user_model';
import {
    Request,
    Res,
    TsoaResponse,
    Controller,
    Get,
    Post,
    Tags,
    Query,
    Body,
    Route,
} from 'tsoa';
import { IReq } from '@root/interfaces/vendors';
import { Response, SuccessResponse } from '@tsoa/runtime';
const generateActivationKey = async () => {
    const randomBytesPromiseified = promisify(require('crypto').randomBytes);
    const activationKey = (await randomBytesPromiseified(32)).toString('hex');
    return activationKey;
};

@Route('api/auth')
@Tags('Authentication')
export class AuthController extends Controller {
    @Get('github/callback')
    @Response(400, 'Invalid access token or code')
    @Response(500, 'User role does not exist. Please contact the admin.')
    @SuccessResponse(
        204,
        `
        - User logged in successfully
        \n- User created successfully`
    )
    public async githubHandler(
        @Request() _req: Express.Request,
        @Res() res: TsoaResponse<204, { message: string }>,
        @Query() code?: string
    ): Promise<void> {
        const Roles = await Role.getRoles();
        // check if user role exists
        if (!Roles.USER)
            throw new AppError(
                500,
                'User role does not exist. Please contact the admin.'
            );
        if (!code) throw new AppError(400, 'Please provide code');
        const { access_token } = await getGithubOAuthToken(code);
        if (!access_token) throw new AppError(400, 'Invalid code');
        const githubUser = await getGithubOAuthUser(access_token);
        const primaryEmail = await getGithubOAuthUserPrimaryEmail(access_token);
        // check if user exists
        const exists = await User.findOne({ email: primaryEmail });
        if (exists) {
            const accessToken = AuthUtils.generateAccessToken(
                exists._id.toString()
            );
            const refreshToken = AuthUtils.generateRefreshToken(
                exists._id.toString()
            );
            AuthUtils.setAccessTokenCookie(this, accessToken);
            AuthUtils.setRefreshTokenCookie(this, refreshToken);
            res(204, { message: 'User logged in successfully' });
            return;
        }
        // check if user is a new github user
        if (!githubUser) throw new AppError(400, 'Invalid access token');
        // create new user
        const createdUser = await User.create({
            name: githubUser.name,
            email: primaryEmail,
            password: null,
            address: githubUser.location ? githubUser.location : null,
            roles: [Roles.USER.name],
            authorities: Roles.USER.authorities,
            restrictions: Roles.USER.restrictions,
            githubOauthAccessToken: access_token,
            active: true,
        });
        // set cookies
        const accessToken = AuthUtils.generateAccessToken(
            createdUser._id.toString()
        );
        const refreshToken = AuthUtils.generateRefreshToken(
            createdUser._id.toString()
        );
        AuthUtils.setAccessTokenCookie(this, accessToken);
        AuthUtils.setRefreshTokenCookie(this, refreshToken);

        res(204, { message: 'User created successfully' });
    }

    @Post('login')
    @Response(
        400,
        `- Please provide email and password
        \n- Invalid email or password
        \n- You haven't set a password yet. Please login with GitHub and set a password from your profile page.`
    )
    @Response(401, 'Invalid email or password')
    @Response(
        403,
        'Your account has been banned. Please contact the admin for more information.'
    )
    @SuccessResponse(200, 'OK')
    public async login(
        @Request() _req: Express.Request,
        @Res() res: TsoaResponse<200, { accessToken: string; user: any }>,
        @Body() body?: { email?: string; password?: string }
    ): Promise<void> {
        const { email, password } = body;

        // 1) check if password exist
        if (!password || !email) {
            throw new AppError(400, 'Please provide email and password');
        }
        // 2) check if user exist and password is correct
        const user = await User.findOne({
            email,
        }).select('+password');

        if (!user) {
            throw new AppError(400, 'Invalid email or password');
        }

        // check if password exist and  it is a string
        // TODO: add test for this
        if (!user?.password)
            throw new AppError(
                400,
                "You haven't set a password yet. Please login with github and set a password from your profile page."
            );

        if (!(await user.correctPassword(password, user.password))) {
            throw new AppError(401, 'Invalid email or password');
        }

        // Check if the account is banned
        if (user && user?.accessRestricted)
            throw new AppError(
                403,
                'Your account has been banned. Please contact the admin for more information.'
            );

        // 3) All correct, send accessToken & refreshToken to client via cookie
        const accessToken = AuthUtils.generateAccessToken(user._id.toString());
        const refreshToken = AuthUtils.generateRefreshToken(
            user._id.toString()
        );
        AuthUtils.setAccessTokenCookie(this, accessToken);
        AuthUtils.setRefreshTokenCookie(this, refreshToken);

        // Remove the password from the output
        user.password = undefined;

        return res(200, {
            accessToken,
            user,
        });
    }
    @Post('signup')
    @Response(
        400,
        `- Please provide a password
        \n- Please provide an email
        \n- Please provide a name
        `
    )
    @Response(500, 'User role does not exist. Please contact the admin.')
    @SuccessResponse(201, 'Created')
    public async signup(
        @Request() _req: Express.Request,
        @Res() res: TsoaResponse<201, { accessToken: string; user: any }>,
        @Body() body?: { name?: string; email?: string; password?: string }
    ) {
        const activationKey = await generateActivationKey();
        const Roles = await Role.getRoles();
        // check if user role exists
        if (!Roles.USER)
            throw new AppError(
                500,
                'User role does not exist. Please contact the admin.'
            );

        // check if password is provided
        if (!body.password)
            throw new AppError(400, 'Please provide a password');

        const userpayload = {
            name: body.name,
            email: body.email,
            password: body.password,
            roles: [Roles.USER.name],
            authorities: Roles.USER.authorities,
            active: !REQUIRE_ACTIVATION,
            restrictions: Roles.USER.restrictions,
            ...(REQUIRE_ACTIVATION && { activationKey }),
        };
        const user = await User.create(userpayload);
        const accessToken = AuthUtils.generateAccessToken(user._id.toString());
        const refreshToken = AuthUtils.generateRefreshToken(
            user._id.toString()
        );
        AuthUtils.setAccessTokenCookie(this, accessToken);
        AuthUtils.setRefreshTokenCookie(this, refreshToken);
        // Remove the password and activation key from the output
        user.password = undefined;
        user.activationKey = undefined;

        return res(201, {
            accessToken,
            user,
        });
    }
    @Get('refreshToken')
    @Response(400, 'You have to login to continue.')
    @Response(400, 'Invalid refresh token')
    @SuccessResponse(204, 'Token refreshed successfully')
    public async tokenRefres(
        @Request() req: IReq,
        @Res() res: TsoaResponse<204, { message: string }>
    ): Promise<void> {
        // get the refresh token from httpOnly cookie
        const refreshToken = searchCookies(req, 'refresh_token');
        if (!refreshToken)
            throw new AppError(400, 'You have to login to continue.');
        const refreshTokenPayload =
            await AuthUtils.verifyRefreshToken(refreshToken);
        if (!refreshTokenPayload || !refreshTokenPayload._id)
            throw new AppError(400, 'Invalid refresh token');
        const user = await User.findById(refreshTokenPayload._id);
        if (!user) throw new AppError(400, 'Invalid refresh token');
        const accessToken = AuthUtils.generateAccessToken(user._id.toString());
        //set or override accessToken cookie.
        AuthUtils.setAccessTokenCookie(this, accessToken);
        res(204, { message: 'Token refreshed successfully' });
    }
    @Get('logout')
    @Response(400, 'Please provide access token')
    @SuccessResponse(204, 'Logged out successfully')
    public logout(
        @Request() req: IReq,
        @Res() res: TsoaResponse<204, { message: string }>
    ): void {
        const accessToken = searchCookies(req, 'access_token');
        if (!accessToken)
            throw new AppError(400, 'Please provide access token');
        // delete the access token cookie
        this.setHeader(
            'Set-Cookie',
            `access_token=; HttpOnly; Path=/; Expires=${new Date(0)}`
        );
        res(204, { message: 'Logged out successfully' });
    }
    @Get('activate')
    @Response(
        400,
        `- Please provide activation key
        \n- Please provide user id
        \n- Please provide a valid user id`
    )
    @Response(404, 'User does not exist')
    @Response(409, 'User is already active')
    public async activateAccount(
        @Request() _req: IReq,
        @Res() res: TsoaResponse<200, { user: any }>,
        @Query() id?: string,
        @Query() activationKey?: string
    ): Promise<void> {
        if (!activationKey) {
            throw new AppError(400, 'Please provide activation key');
        }
        if (!id) {
            throw new AppError(400, 'Please provide user id');
        }

        // check if a valid id
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new AppError(400, 'Please provide a valid user id');
        }

        const user = await User.findOne({
            _id: id,
        }).select('+activationKey');

        if (!user) {
            throw new AppError(404, 'User does not exist');
        }
        if (user.active) {
            throw new AppError(409, 'User is already active');
        }

        // verify activation key
        if (activationKey !== user.activationKey) {
            throw new AppError(400, 'Invalid activation key');
        }
        // activate user
        user.active = true;
        user.activationKey = undefined;
        await user.save();
        // Remove the password from the output
        user.password = undefined;

        return res(200, {
            user,
        });
    }
}
