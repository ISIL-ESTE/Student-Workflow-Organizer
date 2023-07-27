const {
    GITHUB_OAUTH_CLIENT_ID,
    GITHUB_OAUTH_CLIENT_SECRET,
} = require('../../config/app_config');
const qs = require('qs');
const axios = require('axios');
const AppError = require('../../utils/app_error');

exports.getGithubOAuthToken = async (code) => {
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
        throw new AppError(400, 'fail', 'Invalid code');
    }
};
exports.getGithubOAuthUser = async (access_token) => {
    try {
        const { data } = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });

        return data;
    } catch (err) {
        throw new AppError(400, 'fail', 'Invalid access token');
    }
};
exports.getGithubOAuthUserPrimaryEmail = async (access_token) => {
    try {
        const { data } = await axios.get('https://api.github.com/user/emails', {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
        const primaryEmail = data.find((email) => email.primary === true);
        return primaryEmail.email;
    } catch (err) {
        throw new AppError(400, 'fail', 'Invalid access token');
    }
};
