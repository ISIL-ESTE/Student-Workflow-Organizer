export default interface Repository {
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
