const mongoose = require('mongoose');
const Logger = require('./utils/Logger');
const { DATABASE, PORT, DATABASE_PASSWORD } = require('./config/appConfig');

process.on('uncaughtException', (err) => {
  Logger.error('UNCAUGHT EXCEPTION!!!  shutting down ...');
  Logger.error(`${err.name}, ${err.message}`);
  process.exit(1);
});

const app = require('./app');

const database = DATABASE.replace('<PASSWORD>', DATABASE_PASSWORD);

mongoose.set('strictQuery', true);

// Connect the database
mongoose
  .connect(database, { useNewUrlParser: true })
  .then((con) => {
    Logger.info('DB Connected Successfully!');
  })
  .catch((err) => {
    Logger.error('DB Connection Failed!');
  }); //Now all the errors of mongo will be handled by the catch block

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
  Logger.error('DB Connection Disconnected!');
});

// Start the server
app.listen(PORT, () => {
  Logger.info(`App running on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  Logger.error('UNHANDLED REJECTION!!!  shutting down ...');
  Logger.error(`${err.name}, ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
