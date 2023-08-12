const path = require('path');
const fs = require('fs');
const YAML = require('yamljs');

/**
 * Merges all the YAML files in a directory
 * @param {String} directoryPath
 */
const mergeYamlFiles = (directoryPath) => {
    const mergedYamlObject = {};
    // check directory exists
    if (!fs.existsSync(directoryPath)) {
        Logger.error(`Directory ${directoryPath} does not exist`);
        fs.mkdirSync(directoryPath);
    }
    const files = fs.readdirSync(directoryPath);
    files.forEach((file) => {
        if (path.extname(file) !== '.yaml')
            Logger.warn(`Skipping file ${file} as it is not a YAML file`);
        const yamlFilePath = path.join(directoryPath, file);
        const fileContents = fs.readFileSync(yamlFilePath, 'utf8');
        const yamlData = YAML.parse(fileContents);
        Object.assign(mergedYamlObject, yamlData);
    });
    return mergedYamlObject;
};

module.exports = mergeYamlFiles;
