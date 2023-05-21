const swaggerUi = require('swagger-ui-express');
const path = require('path');
const YAML = require('yamljs');
const mergeYamlFiles = require('./mergeYamlFiles');
const { application } = require('express');
// Path to the swagger annotations directory
const docsDirPath = path.join(__dirname, '../../docs');
// Path to the swagger.yaml file
const swaggerSpecPath = path.join(__dirname, '../../swagger.yaml');
// Load the swagger.yaml file
const swaggerSpec = YAML.load(swaggerSpecPath);
// Merge the swagger.yaml file with the swagger annotations
swaggerSpec.paths = mergeYamlFiles(docsDirPath);

/**
 * This function configures the swagger documentation
 * @param { application } app - The express application
 * @returns {void}
 */
const swaggerDocs = (app) => {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = swaggerDocs;
