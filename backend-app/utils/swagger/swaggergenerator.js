const swaggerAutogen = require('swagger-autogen');
require('../logger');

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
const register = async (tag, routePath) => {
    await swaggerAutogen(options)(outputFile, [routePath]);
    const fs = require('fs');
    const rawdata = fs.readFileSync(outputFile);
    const s = JSON.parse(rawdata);
    // to all request add tag tag
    for (const [key, value] of Object.entries(s.paths)) {
        for (const [method, data] of Object.entries(value)) {
            data.tags = [tag];
        }
    }
    const jsYaml = require('js-yaml');
    const yamlData = jsYaml.dump(s.paths);
    // save to swagger2.yaml
    fs.writeFileSync(`./docs/api_docs/${tag}.yaml`, yamlData);
    fs.unlinkSync(outputFile);
    Logger.info(`Swagger docs for route [ ${tag} ] generated successfully`);
};

exports.register = register;
