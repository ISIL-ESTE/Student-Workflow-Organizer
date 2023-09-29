import { Request } from 'express';

export interface IReq extends Request {
    user: {
        _id: string;
        roles: string[];
        authorities: string[];
        restrictions: string[];
        active: boolean;
        githubOauthAccessToken?: string;
    };
}

import { Response } from 'express';

export interface IRes extends Response {}

import { NextFunction } from 'express';

export interface INext extends NextFunction {}
