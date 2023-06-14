const { join } = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: join(__dirname, '../.env') });

exports.logFilePath = join(__dirname, '../server-logs');
exports.DATABASE = process.env.MONGO_URI;
exports.PORT = process.env.PORT;
exports.CURRENT_ENV = process.env.NODE_ENV || 'development';
exports.ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';
exports.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
