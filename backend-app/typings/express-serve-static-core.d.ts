import { Express } from 'express-serve-static-core';
import { ObjectId } from 'mongoose';
declare module 'express-serve-static-core' {
    interface Request {
        user:
            | {
                  _id: ObjectId;
                  name?: string;
                  email: string;
                  roles?: string[];
                  authorities?: string[];
                  restrictions?: string[];
                  active: boolean;
                  githubOauthAccessToken?: string;
              }
            | undefined;
    }
}
