const { join } = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// load env file
const envFile = fs.existsSync('.env') ?  '.env' : '.env.example';
dotenv.config( { path: join(__dirname, `../${envFile}`) } );

exports.logFilePath = join(__dirname, '../server-logs');
exports.CURRENT_ENV = process.env.NODE_ENV ?.toLowerCase();
exports.API_VERSION = process.env.API_VERSION ;
exports.DATABASE = process.env.MONGO_URI ;
exports.PORT = process.env.PORT ;
exports.ADMIN_EMAIL = process.env.ADMIN_EMAIL ;
exports.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ;
exports.JWT_SECRET = process.env.JWT_SECRET ;
exports.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ;
exports.REQUIRE_ACTIVATION = process.env.REQUIRE_ACTIVATION ;
exports.RATE_LIMIT_PER_HOUR = process.env.RATE_LIMIT_PER_HOUR ;
exports.GITHUB_OAUTH_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID;
exports.GITHUB_OAUTH_CLIENT_SECRET = process.env.GITHUB_OAUTH_CLIENT_SECRET;
exports.GITHUB_OAUTH_REDIRECT_URL = process.env.GITHUB_OAUTH_REDIRECT_URL;
