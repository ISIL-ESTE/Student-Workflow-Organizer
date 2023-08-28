const swaggerUi = require('swagger-ui-express');
const { PORT, CURRENT_ENV } = require('../../config/app_config');
const path = require('path');
const YAML = require('yamljs');
const mergeYamlFiles = require('./merge_yaml_files');
// Path to the swagger annotations directory
const docsDirPath = path.join(__dirname, '../../docs/api_docs/');
// Path to the swagger.yaml file
const swaggerSpecPath = path.join(__dirname, '../../swagger.yaml');
// Load the swagger.yaml file
const swaggerSpec = YAML.load(swaggerSpecPath);
// Merge the swagger.yaml file with the swagger annotations
swaggerSpec.paths = mergeYamlFiles(docsDirPath);
swaggerSpec.servers = [
    {
        url: `http://localhost:${PORT}/api`,
        description: 'Development server',
    },
];
const swaggerUiOptions = {
    swaggerOptions: {
        tryItOutEnabled: true,
        // Show the request duration (in ms) in the responses
        displayRequestDuration: true,
        // other advanced settings
        showExtensions: true,
        filter: true,
        showCommonExtensions: true,
        layout: 'BaseLayout',
        deepLinking: true,
    },
};
/**
 * This function configures the swagger documentation
 * @param { application } app - The express application
 * @returns {void}
 */
const swaggerDocs = (app) => {
    if (CURRENT_ENV === 'production') return;
    app.use(
        '/docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, swaggerUiOptions)
    );
    // Get docs in JSON format
    app.get('/docs-json', (_, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
    global.Logger.info(`Swagger available at /docs  /docs-json`);
};

module.exports = swaggerDocs;
