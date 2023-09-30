import { Request } from 'express';

const searchCookies = (req: Request, cookieName: string): string => {
    const cookies: { [key: string]: string } =
        Object.keys(req.signedCookies).length > 0 ? req.signedCookies : false;
    if (!cookies) return undefined;
    const cookie = cookies[cookieName];
    if (!cookie) return undefined;
    return cookie;
};

export default searchCookies;
