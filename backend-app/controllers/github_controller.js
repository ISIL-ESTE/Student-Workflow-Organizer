const User = require('../models/user/user_model');
const axios = require('axios');
const AppError = require('../utils/app_error');

exports.getRecentRepo = async (req, res, next) => {
    const { githubOauthAccessToken } = req.user;
    try {
        const userRepositories = await axios.get(
            'https://api.github.com/user/repos',
            {
                headers: {
                    Authorization: `Bearer ${githubOauthAccessToken}`,
                },
            }
        );
        const mappedUserRepositories = userRepositories.data.map(
            (repository) => ({
                id: repository.id,
                name: repository.name,
                full_name: repository.full_name,
                description: repository.description,
                isFork: repository.fork,
                language: repository.language,
                license: repository.license?.name
                    ? repository.license.name
                    : null,
                openedIssuesCount: repository.open_issues_count,
                repoCreatedAt: repository.created_at,
                url: repository.url,
            })
        );
        if (mappedUserRepositories.length <= 0)
            throw new AppError(400, 'fail', 'No repositories found');
        const sortedRepository = mappedUserRepositories.sort(
            (a, b) => new Date(b.repoCreatedAt) - new Date(a.repoCreatedAt)
        );

        const recentRepository = sortedRepository[0];
        res.status(200).json({
            data: {
                recentRepository,
            },
        });
    } catch (err) {
        next(err);
    }
};
