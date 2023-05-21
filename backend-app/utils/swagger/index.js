const swaggerUi = require('swagger-ui-express');
const { PORT, CURRENT_ENV } = require('../../config/appConfig');
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
  if (CURRENT_ENV.toLowerCase() === 'production') return;
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  // Get docs in JSON format
  app.get('/docs-json', (_, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
  global.Logger.info(`Swagger docs available at http://localhost:${PORT}/docs`);
  global.Logger.info(
    `Swagger docs in JSON format available at http://localhost:${PORT}/docs-json`
  );
};

module.exports = swaggerDocs;
