import { CURRENT_ENV } from '@config/app_config';
import { IRes } from '@interfaces/vendors';
import swaggerUi from 'swagger-ui-express';
import * as swaggerjson from '@root/docs/api_docs/swagger.json';

/**
 * This function configures the swagger documentation
 * @param { application } app - The express application
 * @returns {void}
 */
const swaggerDocs = (app: any): void => {
    if (CURRENT_ENV === 'production') return;
    app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerjson));
    // Get docs in JSON format
    app.get('/docs-json', (_: any, res: IRes) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swaggerjson);
    });
};

export default swaggerDocs;
