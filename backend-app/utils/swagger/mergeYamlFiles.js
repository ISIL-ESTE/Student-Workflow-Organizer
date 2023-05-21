const path = require('path');
const fs = require('fs');
const YAML = require('yamljs');

/**
 * This file contains the function that merges all the YAML files in a directory
 * @param {String} directoryPath
 */
const mergeYamlFiles = (directoryPath) => {
  const mergedYamlObject = {};
  // I have to extract all the files from the directory
  const files = fs.readdirSync(directoryPath);
  // Loop through each of the files
  files.forEach((file) => {
    // Check if the file is a YAML file
    if (path.extname(file) !== '.yaml') return;
    // Construct the path to the file
    const yamlFilePath = path.join(directoryPath, file);
    // Read the file contents
    const fileContents = fs.readFileSync(yamlFilePath, 'utf8');
    // Parse the YAML content and merge it into the main object
    const yamlData = YAML.parse(fileContents);
    // Merge the data into the main object
    Object.assign(mergedYamlObject, yamlData);
  });
  return mergedYamlObject;
};

module.exports = mergeYamlFiles;
