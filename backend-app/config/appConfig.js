const { join } = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: join(__dirname, '../.env') });

exports.logFilePath = join(__dirname, '../server-logs');
exports.DATABASE = process.env.MONGO_URI;
exports.DATABASE_PASSWORD = process.env.DATABASE_PASSWORD;
exports.PORT = process.env.PORT;
exports.CURRENT_ENV = process.env.NODE_ENV || 'development';
