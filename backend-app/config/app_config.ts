import { join } from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// load env file
const envFile = fs.existsSync('.env') ? '.env' : '.env.example';
dotenv.config({ path: join(__dirname, `../${envFile}`) });

// parse boolean values
const parseBoolean = (value: string): boolean => value === 'true';

export const logFilePath = join(__dirname, '../server-logs');
export const CURRENT_ENV = process.env.NODE_ENV?.toLowerCase();
export const API_VERSION = process.env.npm_package_version;
export const DATABASE = process.env.MONGO_URI;
export const MONGO_URI_TEST = process.env.MONGO_URI_TEST;
export const PORT = process.env.PORT;
export const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
export const REQUIRE_ACTIVATION = parseBoolean(process.env.REQUIRE_ACTIVATION);
export const RATE_LIMIT_PER_HOUR = process.env.RATE_LIMIT_PER_HOUR;
export const GITHUB_OAUTH_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID;
export const GITHUB_OAUTH_CLIENT_SECRET =
    process.env.GITHUB_OAUTH_CLIENT_SECRET;
export const GITHUB_OAUTH_REDIRECT_URL = process.env.GITHUB_OAUTH_REDIRECT_URL;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const ACCESS_TOKEN_EXPIRY_TIME = process.env.ACCESS_TOKEN_EXPIRY_TIME;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const REFRESH_TOKEN_EXPIRY_TIME = process.env.REFRESH_TOKEN_EXPIRY_TIME;
export const ACCESS_TOKEN_COOKIE_EXPIRY_TIME =
    process.env.ACCESS_TOKEN_COOKIE_EXPIRY_TIME;
export const REFRESH_TOKEN_COOKIE_EXPIRY_TIME =
    process.env.REFRESH_TOKEN_COOKIE_EXPIRY_TIME;
export const COOKIE_SECRET = process.env.COOKIE_SECRET;
