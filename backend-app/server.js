const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Logger = require('./utils/Logger');
dotenv.config();

process.on('uncaughtException', (err) => {
  Logger.error('UNCAUGHT EXCEPTION!!!  shutting down ...');
  Logger.error(`${err.name}, ${err.message}`);
  process.exit(1);
});

const app = require('./app');

const database = (process.env.DATABASE || '').replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.set('strictQuery', true);


// Connect the database
mongoose
  .connect(database, { useNewUrlParser: true })
  .then((con) => {
    Logger.info('DB Connected Successfully!');
  })
  .catch((err) => {
    Logger.error('DB Connection Failed! \n\tException : '+err)
  }); //Now all the errors of mongo will be handled by the catch block

// If the connection throws an error
mongoose.connection.on('error', (err) => {
  Logger.error('DB Connection Error!');
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
  Logger.error('DB Connection Disconnected!');
});

// Start the server
const port = process.env.PORT;
app.listen(port, () => {
  Logger.info(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  Logger.error('UNHANDLED REJECTION!!!  shutting down ...');
  Logger.error(`${err.name}, ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});
