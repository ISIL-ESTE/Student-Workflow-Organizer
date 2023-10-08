import mongoose from 'mongoose';
import './utils/register_paths';
import logger from '@utils/logger';
import fs from 'fs';
import { DATABASE, PORT } from './config/app_config';
import createRoles from './utils/authorization/roles/create_roles';

process.on('uncaughtException', (err) => {
    logger.error('UNCAUGHT EXCEPTION!!!  shutting down ...');
    logger.error(`${err}, ${err.message}, ${err.stack}`);
    process.exit(1);
});

import app from './app';

mongoose.set('strictQuery', true);

let expServer: Promise<import('http').Server>;

// Connect the database
mongoose
    .connect(
        DATABASE as string,
        { useNewUrlParser: true } as mongoose.ConnectOptions
    )
    .then(() => {
        logger.info('DB Connected Successfully!');
        expServer = startServer();
        logger.info(`Swagger Will Be Available at /docs  /docs-json`);
    })
    .catch((err: Error) => {
        logger.error(
            'DB Connection Failed! \n\tException : ' + err + '\n' + err.stack
        );
    });

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
    logger.error('DB Connection Disconnected!');
});

// Start the server
const startServer = async (): Promise<import('http').Server> => {
    if (!fs.existsSync('.env'))
        logger.warn('.env file not found, using .env.example file');
    logger.info(`App running on  http://localhost:${PORT}`);
    await createRoles();
    return app.listen(PORT);
};

import createDefaultUser from './utils/create_default_user';
createDefaultUser();

process.on('unhandledRejection', (err: Error) => {
    logger.error('UNHANDLED REJECTION!!!  shutting down ...');
    logger.error(`${err.name}, ${err.message}, ${err.stack}`);
    expServer.then((server) => {
        server.close(() => {
            process.exit(1);
        });
    });
});

// add graceful shutdown.
process.on('SIGTERM', () => {
    logger.info('SIGINT RECEIVED. Shutting down gracefully');
    mongoose.connection.close(false).then(() => {
        logger.info('💥 Process terminated!');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT RECEIVED. Shutting down gracefully');
    mongoose.connection.close(false).then(() => {
        logger.info('💥 Process terminated!');
        process.exit(0);
    });
});
