import logger from '@utils/logger';
import { CURRENT_ENV } from '@config/app_config';
import { IRes } from '@interfaces/vendors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'My API',
        version: '1.0.0',
        description: 'API Documentation',
    },
};
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

const swaggerSpec = swaggerJsdoc({
    swaggerDefinition,
    apis: ['./routes/**/*.ts'],
});

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
    logger.info('list of all env variables', process.env);
};

export default swaggerDocs;
