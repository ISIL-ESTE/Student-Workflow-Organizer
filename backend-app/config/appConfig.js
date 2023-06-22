const { join } = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: join(__dirname, '../.env') });

exports.logFilePath = join(__dirname, '../server-logs');
exports.CURRENT_ENV = process.env.NODE_ENV || 'development';
exports.DATABASE = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
exports.PORT = process.env.PORT || '5000';
exports.ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';
exports.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
exports.ACCESS_TOKEN_EXPIRES_IN = process.env.ACCESS_TOKEN_EXPIRES_IN || '10m';
exports.REFRESH_TOKEN_EXPIRES_IN =
  process.env.REFRESH_TOKEN_EXPIRES_IN || '90d';
exports.TOKEN_ISSUER = process.env.TOKEN_ISSUER || 'example.com';
exports.TOKEN_AUDIENCE = process.env.TOKEN_AUDIENCE || 'example.com';
