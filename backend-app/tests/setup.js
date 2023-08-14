const request = require('supertest');
const createRoles = require('../utils/authorization/role/create_roles');
const createDefaultUser = require('../utils/create_default_user');
const { testUserCredentials } = require('./testConstants');
const { MONGO_URI_TEST } = require('../config/app_config');
const app = require('../app');
const mongoose = require('mongoose');

async function globalSetup() {
    mongoose.set('strictQuery', false);
    console.log(MONGO_URI_TEST);
    mongoose.connect(MONGO_URI_TEST, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    await createRoles();
    await createDefaultUser();

    request(app)
        .post('/api/auth/signup')
        .send({
            name: testUserCredentials.userName,
            email: testUserCredentials.userEmail,
            password: testUserCredentials.userPassword,
        })
        .then((res) => {
            console.log('User created for testing: ', res.body);
        })
        .catch((err) => {
            console.log('Error creating user for testing', err);
        });
}

module.exports = globalSetup;
