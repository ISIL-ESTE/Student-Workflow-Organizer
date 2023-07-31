const mongoose = require('mongoose');
require('./utils/logger');
const fs = require('fs');
const { DATABASE, PORT } = require('./config/app_config');
const createRoles = require('./utils/authorization/role/create_roles');

process.on('uncaughtException', (err) => {
    Logger.error('UNCAUGHT EXCEPTION!!!  shutting down ...');
    Logger.error(`${err.name}, ${err.message}, ${err.stack}`);
    process.exit(1);
});

const app = require('./app');

mongoose.set('strictQuery', true);

// Connect the database
mongoose
    .connect(DATABASE, { useNewUrlParser: true })
    .then((con) => {
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
    Logger.info(`App running on port ${PORT}`);
    await createRoles();
});

// create the admin user if not exists
require('./utils/create_default_user')();

process.on('unhandledRejection', (err) => {
    Logger.error('UNHANDLED REJECTION!!!  shutting down ...');
    Logger.error(`${err.name}, ${err.message}, ${err.stack}`);
    expServer.close(() => {
        process.exit(1);
    });
});

// add graceful shutdown.
process.on('SIGTERM', () => {
    Logger.info('SIGTERM RECEIVED. Shutting down gracefully');
    expServer.close(() => {
        mongoose.connection.close(false, () => {
            Logger.info('💥 Process terminated!');
        });
    });
});

process.on('SIGINT', () => {
    Logger.info('SIGINT RECEIVED. Shutting down gracefully');
    expServer.close(() => {
        mongoose.connection.close(false, () => {
            Logger.info('💥 Process terminated!');
        });
    });
});
