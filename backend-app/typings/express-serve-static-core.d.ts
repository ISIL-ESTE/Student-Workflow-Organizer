import { Express } from 'express-serve-static-core';
declare module 'express-serve-static-core' {
    interface Request {
        user:
            | {
                  _id: string;
                  roles: string[];
                  authorities: string[];
                  restrictions: string[];
                  active: boolean;
                  githubOauthAccessToken?: string;
              }
            | undefined;
    }
}
