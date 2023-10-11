import {
    ACCESS_TOKEN_SECRET,
    ACCESS_TOKEN_EXPIRY_TIME,
    REFRESH_TOKEN_SECRET,
    REFRESH_TOKEN_EXPIRY_TIME,
} from '@config/app_config';
import AppError from '@utils/app_error';
import jwt from 'jsonwebtoken';

const generateTokens = (id: string) => {
    try {
        const accessToken = jwt.sign({ id }, ACCESS_TOKEN_SECRET, {
            expiresIn: ACCESS_TOKEN_EXPIRY_TIME,
        });
        const refreshToken = jwt.sign({ id }, REFRESH_TOKEN_SECRET, {
            expiresIn: REFRESH_TOKEN_EXPIRY_TIME,
        });
        if (!accessToken || !refreshToken)
            throw new AppError(
                500,
                'Something went wrong. Please try again later.'
            );
        return { accessToken, refreshToken };
    } catch (err) {
        throw new AppError(
            500,
            'Something went wrong. Please try again later.'
        );
    }
};
export default generateTokens;
