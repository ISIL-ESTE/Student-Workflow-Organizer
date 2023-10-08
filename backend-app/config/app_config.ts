import { join } from 'path';
import dotenv from 'dotenv';
import fs from 'fs';

// load env file
const envMode = process.env.NODE_ENV?.toLowerCase();
const envFile =
    envMode === 'production'
        ? '.env.production'
        : fs.existsSync('.env')
        ? '.env'
        : '.env.example';

if (envFile) {
    dotenv.config({ path: join(__dirname, `../${envFile}`) });
}

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
export const REQUIRE_ACTIVATION = parseBoolean(
    process.env.REQUIRE_ACTIVATION as string
);
export const RATE_LIMIT_PER_HOUR = process.env
    .RATE_LIMIT_PER_HOUR as unknown as number;
export const OAUTH_CLIENT_ID_GITHUB = process.env.OAUTH_CLIENT_ID_GITHUB;
export const OAUTH_CLIENT_SECRET_GITHUB =
    process.env.OAUTH_CLIENT_SECRET_GITHUB;
export const OAUTH_REDIRECT_URL_GITHUB = process.env.OAUTH_REDIRECT_URL_GITHUB;
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const ACCESS_TOKEN_EXPIRY_TIME = process.env.ACCESS_TOKEN_EXPIRY_TIME;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const REFRESH_TOKEN_EXPIRY_TIME = process.env.REFRESH_TOKEN_EXPIRY_TIME;
export const ACCESS_TOKEN_COOKIE_EXPIRY_TIME =
    process.env.ACCESS_TOKEN_COOKIE_EXPIRY_TIME;
export const REFRESH_TOKEN_COOKIE_EXPIRY_TIME =
    process.env.REFRESH_TOKEN_COOKIE_EXPIRY_TIME;
export const COOKIE_SECRET = process.env.COOKIE_SECRET;
