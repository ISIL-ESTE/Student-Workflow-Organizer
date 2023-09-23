import swaggerUi from 'swagger-ui-express';
import logger from '@utils/logger';
import { PORT, CURRENT_ENV } from '../../config/app_config';
import path from 'path';
import YAML from 'yamljs';
import mergeYamlFiles from './merge_yaml_files';
import { IRes } from '@interfaces/vendors';

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
        files: ['@routes/**/*.{js,ts}'],
    },
};

/**
 * This function configures the swagger documentation
 * @param { application } app - The express application
 * @returns {void}
 */
const swaggerDocs = (app: any): void => {
    if (CURRENT_ENV === 'production') return;
    app.use(
        '/docs',
        swaggerUi.serve,
        swaggerUi.setup(swaggerSpec, swaggerUiOptions)
    );
    // Get docs in JSON format
    app.get('/docs-json', (_: any, res: IRes) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerSpec);
    });
    logger.info(`Swagger available at /docs  /docs-json`);
};

export default swaggerDocs;
