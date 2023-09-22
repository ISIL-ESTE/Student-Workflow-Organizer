import { Request } from 'express';

export interface IReq extends Request {
    user?: {
        _id: string;
        githubOauthAccessToken: string;
    };
    params: any;
}

import { Response } from 'express';

export interface IRes extends Response {}

import { NextFunction } from 'express';

export interface INext extends NextFunction {}
