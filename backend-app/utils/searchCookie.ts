import { Request } from 'express';

const searchCookies = (
    req: Request,
    cookieName: string
): string | undefined => {
    const cookies = req.cookies;
    if (!cookies || !cookies[cookieName]) {
        return undefined;
    }
    return cookies[cookieName];
};

export default searchCookies;
