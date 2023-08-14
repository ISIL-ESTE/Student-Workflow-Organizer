module.exports = {
    testEnvironment: 'node',
    globalSetup: './tests/setup.js',
    globalTeardown: './tests/teardown.js',
    setupFilesAfterEnv: ['./tests/db_config.js'],
    verbose: true,
    preset: '@shelf/jest-mongodb',
    testTimeout: 30000,
};
