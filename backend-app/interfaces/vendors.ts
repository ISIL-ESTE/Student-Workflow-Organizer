import { Request, Response } from 'express';

export interface IReq extends Request {
    user: {
        _id: ObjectId;
        name?: string;
        email: string;
        roles?: string[];
        authorities?: string[];
        restrictions?: string[];
        active: boolean;
        githubOauthAccessToken?: string;
    };
}

export interface IRes extends Response {}

import { NextFunction } from 'express';
import { ObjectId } from 'mongoose';

export interface INext extends NextFunction {}
