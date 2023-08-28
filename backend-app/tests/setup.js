const request = require('supertest');
const createRoles = require('../utils/authorization/role/create_roles');
const createDefaultUser = require('../utils/create_default_user');
const { testUserCredentials } = require('./testConstants');
const { MONGO_URI_TEST } = require('../config/app_config');
const app = require('../app');
const mongoose = require('mongoose');

async function globalSetup() {
    mongoose.set('strictQuery', false);
    mongoose.connect(MONGO_URI_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    await createRoles();
    await createDefaultUser();
}

module.exports = globalSetup;
