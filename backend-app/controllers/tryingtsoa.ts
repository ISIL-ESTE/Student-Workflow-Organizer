import { Controller, Route } from 'tsoa';
import { Body, Post, Query, Response, Path, Middlewares } from '@tsoa/runtime';
import { Request, Response as i_res } from 'express';

// interface IUser {
//     /**
//      * @isString Please enter a valid name as a string
//      * @minLength 1 Name must have at least 1 character
//      * @maxLength 255 Name should not exceed 255 characters
//      */
//     name: string;

//     /**
//      * @isString Please enter a valid email address
//      * @isEmail Please provide a valid email format
//      * @minLength 5 Email must have at least 5 characters
//      * @maxLength 255 Email should not exceed 255 characters
//      */
//     email: string;

//     /**
//      * @isString Please enter a valid address as a string
//      * @maxLength 255 Address should not exceed 255 characters
//      */
//     address?: string;

//     /**
//      * @isString Please enter a valid password as a string
//      * @minLength 8 Password must have at least 8 characters
//      * @maxLength 255 Password should not exceed 255 characters
//      */
//     password?: string;

//     /**
//      * @isArray Please provide an array of authorities
//      * @minItems 1 At least one authority is required
//      */
//     authorities: string[];

//     /**
//      * @isArray Please provide an array of restrictions
//      * @uniqueItems Restrictions should be unique
//      */
//     restrictions: string[];

//     /**
//      * @isArray Please provide an array of roles
//      * @uniqueItems Roles should be unique
//      */
//     roles: string[];

//     /**
//      * @isBool Please provide a valid boolean value for active
//      */
//     active: boolean;

//     /**
//      * @isString Please provide a valid activation key as a string
//      * @maxLength 255 Activation key should not exceed 255 characters
//      */
//     activationKey?: string;

//     /**
//      * @isBool Please provide a valid boolean value for accessRestricted
//      */
//     accessRestricted: boolean;

//     /**
//      * @isString Please provide a valid GitHub OAuth access token as a string
//      * @maxLength 255 GitHub OAuth access token should not exceed 255 characters
//      */
//     githubOauthAccessToken?: string;

//     /**
//      * @isString Please provide a valid reset key as a string
//      * @maxLength 255 Reset key should not exceed 255 characters
//      */
//     resetKey?: string;

//     /**
//      * @isDateTime Please provide a valid date and time for createdAt
//      */
//     createdAt: Date;

//     /**
//      * @isDateTime Please provide a valid date and time for updatedAt
//      */
//     updatedAt: Date;

//     /**
//      * @isBool Please provide a valid boolean value for deleted
//      */
//     deleted: boolean;

//     /**
//      * @isString Please enter a valid deleted by as a string
//      * @maxLength 255 Deleted by should not exceed 255 characters
//      */
//     deletedBy?: string;

//     /**
//      * @isDateTime Please provide a valid date and time for deletedAt
//      */
//     deletedAt?: Date;

//     /**
//      * @isString Please enter a valid created by as a string
//      * @maxLength 255 Created by should not exceed 255 characters
//      */
//     createdBy?: string;

//     /**
//      * @isString Please enter a valid updated by as a string
//      * @maxLength 255 Updated by should not exceed 255 characters
//      */
//     updatedBy?: string;
// }

interface ValidateErrorJSON {
    message: 'Validation failed';
    details: { [name: string]: unknown };
}

function customMiddleware(req: Request, res: i_res, next: any) {
    // Perform any necessary operations or modifications
    next();
}

@Route('users')
export class UsersController extends Controller {
    /**
     * Retrieves the details of an existing user.
     * Supply the unique user ID from either and receive corresponding user details.
     */
    @Response<ValidateErrorJSON>(404, 'Not Found')
    @Post('{userId}')
    @Middlewares(customMiddleware)
    public getUser(
        @Path() userId: number,
        @Query() name?: string,
        @Body() body?: { name: string }
    ): {} {
        // return new UsersService().get(userId, name);
        return { userId, name };
    }
}
