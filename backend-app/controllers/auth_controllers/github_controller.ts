import axios from 'axios';
import { Request, Response, NextFunction } from 'express';
import AppError from '@utils/app_error';

interface Repository {
    id: number;
    name: string;
    full_name: string;
    description: string;
    isFork: boolean;
    language: string;
    license: string | null;
    openedIssuesCount: number;
    repoCreatedAt: string;
    url: string;
}

interface UserRequest extends Request {
    user: {
        githubOauthAccessToken: string;
    };
}

export const getRecentRepo = async (
    req: UserRequest,
    res: Response,
    next: NextFunction
) => {
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
            (repository: any): Repository => ({
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
        if (mappedUserRepositories.length <= 0) {
            throw new AppError(400, 'No repositories found');
        }

        const sortedRepository = mappedUserRepositories.sort(
            (a: Repository, b: Repository) =>
                new Date(b.repoCreatedAt).getTime() -
                new Date(a.repoCreatedAt).getTime()
        );

        const recentRepository = sortedRepository[0];
        res.status(200).json({
            recentRepository,
        });
    } catch (err) {
        next(err);
    }
};
