// src/users/usersController.ts
// import { IUser } from '@interfaces/models/i_user';
import { NextFunction, Request, Response as IRes } from 'express';
import {
    Body,
    Controller,
    Path,
    Post,
    Query,
    Route,
    SuccessResponse,
    Response,
    Middlewares,
} from 'tsoa';
export interface IUser {
    /**
     * @isString <please enter a valid integer number>
     */
    name: string;
    email: string;
    address?: string;
    password?: string;
    authorities: string[];
    restrictions: string[];
    roles: string[];
    active: boolean;
    activationKey?: string;
    accessRestricted: boolean;
    githubOauthAccessToken?: string;
    resetKey?: string;
    createdAt: Date;
    updatedAt: Date;
    deleted: boolean;
    deletedBy?: string;
    deletedAt?: Date;
    createdBy?: string;
    updatedBy?: string;
}

interface ValidateErrorJSON {
    message: 'Validation failed';
    details: { [name: string]: unknown };
}

function customMiddleware(req: Request, res: IRes, next: NextFunction) {
    // Perform any necessary operations or modifications
    next();
}

@Route('users')
export class UsersController extends Controller {
    /**
     * Retrieves the details of an existing user.
     * Supply the unique user ID from either and receive corresponding user details.
     */
    //    @SuccessResponse('201', 'Created')
    //    // not found response
    //    @Response<ValidateErrorJSON>(404, 'Not Found')
    //    @Post('{userId}')
    //    @Middlewares(customMiddleware)
    //    public async getUser(
    //         @Path() userId: number,
    //         @Query() name?: string,
    //         @Body() body?: IUser
    //     ): Promise<Object> {
    //         // return new UsersService().get(userId, name);
    //         return { userId, name };
    //     }
    // @SuccessResponse('201', 'Created');
}
