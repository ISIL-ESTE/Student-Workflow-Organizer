import * as tsConfigPaths from 'tsconfig-paths';
import * as tsConfig from '../tsconfig.json';

const baseUrl = './';
tsConfigPaths.register({
    baseUrl,
    paths: tsConfig.compilerOptions.paths,
});
