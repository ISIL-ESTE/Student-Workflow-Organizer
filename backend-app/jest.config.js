module.exports = {
    globalSetup: './tests/setup.js',
    globalTeardown: './tests/teardown.js',
    setupFilesAfterEnv: ['./tests/db_config.js'],
    bail: true,
};
