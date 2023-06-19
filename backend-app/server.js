const mongoose = require('mongoose');
require('./utils/Logger');
const { DATABASE, PORT } = require('./config/appConfig');
const createRoles = require('./utils/authorization/role/createRoles');

process.on('uncaughtException', (err) => {
  console.log(err.name, err.message, err.stack);
  Logger.error('UNCAUGHT EXCEPTION!!!  shutting down ...');
  Logger.error(`${err.name}, ${err.message}`);
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
    Logger.error('DB Connection Failed! \n\tException : ' + err);
  }); //Now all the errors of mongo will be handled by the catch block

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
  Logger.error('DB Connection Disconnected!');
});

// Start the server
const expServer = app.listen(PORT, async () => {
  Logger.info(`App running on port ${PORT}`);
  await createRoles();
});

// create the admin user if not exists
require('./utils/createAdminUser');

process.on('unhandledRejection', (err) => {
  Logger.error('UNHANDLED REJECTION!!!  shutting down ...');
  Logger.error(`${err.name}, ${err.message}`);
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
