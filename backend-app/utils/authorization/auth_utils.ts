import {
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY_TIME,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY_TIME,
    ACCESS_TOKEN_COOKIE_EXPIRY_TIME,
    REFRESH_TOKEN_COOKIE_EXPIRY_TIME,
} from '@config/app_config';
import AppError from '@utils/app_error';
import jwt from 'jsonwebtoken';
import { promisify } from 'util';

class AuthUtils {
    static generateAccessToken(_id: string): string {
        return jwt.sign({ _id }, ACCESS_TOKEN_SECRET, {
            expiresIn: ACCESS_TOKEN_EXPIRY_TIME,
        });
    }
    static generateRefreshToken(_id: string): string {
        return jwt.sign({ _id }, REFRESH_TOKEN_SECRET, {
            expiresIn: REFRESH_TOKEN_EXPIRY_TIME,
        });
    }
    static setAccessTokenCookie(res: any, accessToken: string): AuthUtils {
        res.cookie('access_token', accessToken, {
            secure: true,
            sameSite: 'strict',
            maxAge: ACCESS_TOKEN_COOKIE_EXPIRY_TIME,
        });
        return this;
    }
    static setRefreshTokenCookie(res: any, refreshToken: string): AuthUtils {
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: REFRESH_TOKEN_COOKIE_EXPIRY_TIME,
        });
        return this;
    }
    static async verifyAccessToken(token: string): Promise<any> {
        const result = await promisify(jwt.verify.bind(jwt))(
            token,
            ACCESS_TOKEN_SECRET
        );
        return result;
    }
    static async verifyRefreshToken(token: string): Promise<any> {
        try {
            return await promisify(jwt.verify.bind(jwt))(
                token,
                REFRESH_TOKEN_SECRET
            );
        } catch (error) {
            throw new AppError(400, 'Invalid refresh token');
        }
    }
}
export default AuthUtils;
