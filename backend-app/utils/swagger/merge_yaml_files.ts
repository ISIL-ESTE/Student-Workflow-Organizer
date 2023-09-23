import logger from '@utils/logger';
import path from 'path';
import fs from 'fs';
import YAML from 'yamljs';

/**
 * Merges all the YAML files in a directory
 * @param {String} directoryPath
 */
const mergeYamlFiles = (directoryPath: string): Record<string, unknown> => {
    const mergedYamlObject: Record<string, unknown> = {};
    // check directory exists
    if (!fs.existsSync(directoryPath)) {
        logger.error(`Directory ${directoryPath} does not exist`);
        fs.mkdirSync(directoryPath);
    }
    const files = fs.readdirSync(directoryPath);
    files.forEach((file) => {
        if (path.extname(file) !== '.yaml')
            logger.warn(`Skipping file ${file} as it is not a YAML file`);
        const yamlFilePath = path.join(directoryPath, file);
        const fileContents = fs.readFileSync(yamlFilePath, 'utf8');
        const yamlData = YAML.parse(fileContents);
        Object.assign(mergedYamlObject, yamlData);
    });
    return mergedYamlObject;
};

export default mergeYamlFiles;
