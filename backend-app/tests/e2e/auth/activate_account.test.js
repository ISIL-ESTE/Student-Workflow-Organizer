const request = require('supertest');
const app = require('../../../app');
const { REQUIRE_ACTIVATION } = require('../../../config/app_config');
const { testUserCredentials } = require('../../testConstants');
const { user_model } = require('../../../models/user/user_model');
const mongoose = require('mongoose');

// console.log('db connected: ', mongoose.connection.readyState);

if (REQUIRE_ACTIVATION)
    describe('GET /api/auth/activate', () => {
        let user;
        let activationKey;
        beforeAll(async () => {
            user = await user_model
                .findOne({ email: testUserCredentials.userEmail })
                .select('+activationKey');
            activationKey = user.activationKey;
        });
        it('should return 400 if activation key is missing', async () => {
            await request(app).get('/api/auth/activate').query({}).expect(400);
        });
        it('should return 400 if id is missing', async () => {
            await request(app)
                .get('/api/auth/activate')
                .query({ activationKey: activationKey })
                .expect(400);
        });
        it('should return 400 if id is invalid', async () => {
            await request(app)
                .get('/api/auth/activate')
                .query({ activationKey: activationKey, id: 'invalid_id' })
                .expect(400);
        });
        // if user not found
        it('should return 404 if user is not found', async () => {
            await request(app)
                .get('/api/auth/activate')
                .query({
                    activationKey: activationKey,
                    id: '5f9b3b3b3b3b3b3b3b3b3b3b',
                })
                .expect(404);
        });
        it('should return 400 if activation key is invalid', async () => {
            await request(app)
                .get('/api/auth/activate')
                .query({ activationKey: 'invalid_key', id: userId })
                .expect(400);
        });
        it('should return 200 if activation key is valid', async () => {
            await request(app)
                .get('/api/auth/activate')
                .query({ activationKey: activationKey, id: userId })
                .expect(200);
        });
        it('should return 409 if user is already activated', async () => {
            await request(app)
                .get('/api/auth/activate')
                .query({ activationKey: activationKey, id: userId })
                .expect(409);
        });
    });
else
    describe('GET /api/auth/activate', () => {
        it('should return 404', async () => {
            await request(app).get('/api/auth/activate');
        });
    });
