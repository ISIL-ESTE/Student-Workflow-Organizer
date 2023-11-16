import axios from 'axios';
import AppError from '@utils/app_error';
import { IReq } from '@interfaces/vendors';
import {
    Controller,
    Get,
    Request,
    Res,
    Route,
    Security,
    Tags,
    TsoaResponse,
} from 'tsoa';

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
import { Response, SuccessResponse } from '@tsoa/runtime';

@Security('jwt')
@Route('api/github')
@Tags('GitHub')
export class GitHub extends Controller {
    @Get('recent-repo')
    @Response(401, 'You are not logged in')
    @Response(400, 'No repositories found')
    @SuccessResponse(200, 'OK')
    public async getRecentRepo(
        @Request() req: IReq,
        @Res() res: TsoaResponse<200, { recentRepository: Repository }>
    ) {
        if (!req.user) {
            throw new AppError(401, 'You are not logged in');
        }
        const { githubOauthAccessToken } = req.user;
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
        res(200, { recentRepository });
    }
}
