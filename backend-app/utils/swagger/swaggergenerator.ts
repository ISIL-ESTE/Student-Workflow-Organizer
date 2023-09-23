import swaggerAutogen from 'swagger-autogen';
import logger from '../logger';
import fs from 'fs';
import jsYaml from 'js-yaml';

const outputFile = './docs/swagger-output.json';

const options = {
    disableLogs: true,
};

/**
 *
 * @param {string} tag tag name for swagger docs
 * @param {string} routePath path of route file
 * @returns {Promise<void>}
 * */
const register = async (tag: string, routePath: string): Promise<void> => {
    await swaggerAutogen(options)(outputFile, [routePath]);
    const rawdata = fs.readFileSync(outputFile);
    const s = JSON.parse(rawdata.toString());
    // to all request add tag tag
    for (const [key, value] of Object.entries(s.paths)) {
        // @ts-ignore
        for (const [, data] of Object.entries(value)) {
            (data as any).tags = [tag];
        }
    }
    const yamlData = jsYaml.dump(s.paths);
    // save to swagger2.yaml
    fs.writeFileSync(`./docs/api_docs/${tag}.yaml`, yamlData);
    fs.unlinkSync(outputFile);
    logger.info(`Swagger docs for route [ ${tag} ] generated successfully`);
};

export { register };
