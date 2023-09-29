import {
    GITHUB_OAUTH_CLIENT_ID,
    GITHUB_OAUTH_CLIENT_SECRET,
} from '@config/app_config';
import qs from 'qs';
import axios from 'axios';
import AppError from '@utils/app_error';

export const getGithubOAuthToken = async (
    code: string
): Promise<qs.ParsedQs> => {
    const rootUrl = 'https://github.com/login/oauth/access_token';

    const queryString = qs.stringify({
        client_id: GITHUB_OAUTH_CLIENT_ID,
        client_secret: GITHUB_OAUTH_CLIENT_SECRET,
        code,
    });
    try {
        const { data } = await axios.post(`${rootUrl}?${queryString}`, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const decoded = qs.parse(data);

        return decoded;
    } catch (err) {
        throw new AppError(400, 'Invalid code');
    }
};
export const getGithubOAuthUser = async (
    access_token: string
): Promise<any> => {
    try {
        const { data } = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        return data;
    } catch (err) {
        throw new AppError(400, 'Invalid access token');
    }
};
export const getGithubOAuthUserPrimaryEmail = async (
    access_token: string
): Promise<string> => {
    try {
        const { data } = await axios.get('https://api.github.com/user/emails', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        const primaryEmail = data.find((email: any) => email.primary === true);
        return primaryEmail.email;
    } catch (err) {
        throw new AppError(400, 'Invalid access token');
    }
};
