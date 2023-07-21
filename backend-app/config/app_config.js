const { join } = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: join(__dirname, '../.env') });

// console.log(process.env.NODE_ENV);

exports.logFilePath = join(__dirname, '../server-logs');
exports.CURRENT_ENV = process.env.NODE_ENV || 'development';
exports.API_VERSION = process.env.API_VERSION || 'v1';
exports.DATABASE = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
exports.PORT = process.env.PORT || '5000';
exports.ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@gmail.com';
exports.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
exports.JWT_SECRET = process.env.JWT_SECRET || 'sdfsdf';
exports.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';
exports.REQUIRE_ACTIVATION = process.env.REQUIRE_ACTIVATION || true;
// RATE_LIMIT_PER_HOUR
exports.RATE_LIMIT_PER_HOUR = process.env.RATE_LIMIT_PER_HOUR || 500;
exports.GITHUB_OAUTH_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID;
exports.GITHUB_OAUTH_CLIENT_SECRET = process.env.GITHUB_OAUTH_CLIENT_SECRET;
exports.GITHUB_OAUTH_REDIRECT_URL = process.env.GITHUB_OAUTH_REDIRECT_URL;