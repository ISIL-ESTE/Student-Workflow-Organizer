const { join } = require('path');
const dotenv = require('dotenv');
const fs = require('fs');

// load env file
const envFile = fs.existsSync('.env') ? '.env' : '.env.example';
dotenv.config({ path: join(__dirname, `../${envFile}`) });

// parse boolean values
const parseBoolean = (value) => value === 'true';

exports.logFilePath = join(__dirname, '../server-logs');
exports.CURRENT_ENV = process.env.NODE_ENV?.toLowerCase();
exports.API_VERSION = process.env.npm_package_version;
exports.DATABASE = process.env.MONGO_URI;
exports.MONGO_URI_TEST = process.env.MONGO_URI_TEST;
exports.PORT = process.env.PORT;
exports.ADMIN_EMAIL = process.env.ADMIN_EMAIL;
exports.ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
exports.REQUIRE_ACTIVATION = parseBoolean(process.env.REQUIRE_ACTIVATION);
exports.RATE_LIMIT_PER_HOUR = process.env.RATE_LIMIT_PER_HOUR;
exports.GITHUB_OAUTH_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID;
exports.GITHUB_OAUTH_CLIENT_SECRET = process.env.GITHUB_OAUTH_CLIENT_SECRET;
exports.GITHUB_OAUTH_REDIRECT_URL = process.env.GITHUB_OAUTH_REDIRECT_URL;
exports.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
exports.ACCESS_TOKEN_EXPIRY_TIME = process.env.ACCESS_TOKEN_EXPIRY_TIME;
exports.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
exports.REFRESH_TOKEN_EXPIRY_TIME = process.env.REFRESH_TOKEN_EXPIRY_TIME;
exports.ACCESS_TOKEN_COOKIE_EXPIRY_TIME =
    process.env.ACCESS_TOKEN_COOKIE_EXPIRY_TIME;
exports.REFRESH_TOKEN_COOKIE_EXPIRY_TIME =
    process.env.REFRESH_TOKEN_COOKIE_EXPIRY_TIME;
exports.COOKIE_SECRET = process.env.COOKIE_SECRET;
