const request = require('supertest');
const createRoles = require('../utils/authorization/role/create_roles');
const createDefaultUser = require('../utils/create_default_user');
const { testUserCredentials } = require('./testConstants');
const app = require('../app');
const mongoose = require('mongoose');

function globalSetup() {
    mongoose.set('strictQuery', false);
    mongoose.connect(process.env.MONGO_URI_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    // // check if db connection is open

    createRoles();
    createDefaultUser();

    request(app).post('/api/auth/signup').send({
        name: testUserCredentials.userName,
        email: testUserCredentials.userEmail,
        password: testUserCredentials.userPassword,
    });
}

module.exports = globalSetup;
