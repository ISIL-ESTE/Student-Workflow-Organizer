import * as tsConfigPaths from 'tsconfig-paths';
import * as tsConfig from '../tsconfig.json';
import * as path from 'path';

const baseUrl = path.join(__dirname, '../');
tsConfigPaths.register({
    baseUrl,
    paths: tsConfig.compilerOptions.paths,
});
