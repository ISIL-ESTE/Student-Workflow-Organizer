import { Request } from 'express';

const searchCookies = (req: Request, cookieName: string): string | boolean => {
    const cookies: { [key: string]: string } =
        Object.keys(req.signedCookies).length > 0 ? req.signedCookies : false;
    if (!cookies) return false;
    const cookie = cookies[cookieName];
    if (!cookie) return false;
    return cookie;
};

export default searchCookies;
