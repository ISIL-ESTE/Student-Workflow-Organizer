import mongoose from 'mongoose';
import './utils/logger';
import fs from 'fs';
import { DATABASE, PORT } from './config/app_config';
import createRoles from './utils/authorization/role/create_roles';

process.on('uncaughtException', (err) => {
    Logger.error('UNCAUGHT EXCEPTION!!!  shutting down ...');
    Logger.error(`${err.name}, ${err.message}, ${err.stack}`);
    process.exit(1);
});

import app from './app';

mongoose.set('strictQuery', true);

// Connect the database
mongoose
    .connect(DATABASE, { useNewUrlParser: true } as mongoose.ConnectOptions)
    .then(() => {
        Logger.info('DB Connected Successfully!');
    })
    .catch((err) => {
        Logger.error(
            'DB Connection Failed! \n\tException : ' + err + '\n' + err.stack
        );
    }); //Now all the errors of mongo will be handled by the catch block

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
    Logger.error('DB Connection Disconnected!');
});

// Start the server
const expServer = app.listen(PORT, async () => {
    if (!fs.existsSync('.env'))
        Logger.warn('.env file not found, using .env.example file');
    Logger.info(`App running on  http://localhost:${PORT}`);
    await createRoles();
});

import createDefaultUser from './utils/create_default_user';
createDefaultUser();

process.on('unhandledRejection', (err: Error) => {
    Logger.error('UNHANDLED REJECTION!!!  shutting down ...');
    Logger.error(`${err.name}, ${err.message}, ${err.stack}`);
    expServer.close(() => {
        process.exit(1);
    });
});

// add graceful shutdown.
process.on('SIGTERM', () => {
    Logger.info('SIGINT RECEIVED. Shutting down gracefully');
    mongoose.connection.close(false).then(() => {
        Logger.info('💥 Process terminated!');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    Logger.info('SIGINT RECEIVED. Shutting down gracefully');
    mongoose.connection.close(false).then(() => {
        Logger.info('💥 Process terminated!');
        process.exit(0);
    });
});
