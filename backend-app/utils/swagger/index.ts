import { CURRENT_ENV } from '@config/app_config';
import { IRes } from '@interfaces/vendors';
import { NextFunction, Request, Response } from 'express';
import swaggerUi from 'swagger-ui-express';

/**
 * This function configures the swagger documentation
 * @param { application } app - The express application
 * @returns {void}
 */
const swaggerDocs = (app: any): void => {
    if (CURRENT_ENV === 'production') return;
    let swaggerJson: any;
    // Import swaggerjson inside setup function
    app.use(
        '/docs',
        swaggerUi.serve,
        (req: Request, res: Response, next: NextFunction) => {
            delete require.cache[
                require.resolve('@root/docs/api_docs/swagger.json')
            ];
            swaggerJson = require('@root/docs/api_docs/swagger.json');
            swaggerUi.setup(swaggerJson);
            next();
        },
        swaggerUi.setup(swaggerJson)
    );
    // Get docs in JSON format
    app.get('/docs-json', (_: any, res: IRes) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(require('@root/docs/api_docs/swagger.json'));
    });
};

export default swaggerDocs;
