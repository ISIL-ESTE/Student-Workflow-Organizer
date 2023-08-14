const request = require('supertest');
const app = require('../../../app');
const { testUserCredentials } = require('../../testConstants');
const mongoose = require('mongoose');

describe('POST /api/auth/signup', () => {
    // check db connection
    // console.log('db connected: ', mongoose.connection.readyState);

    it('should create a new user', async () => {
        const response = await request(app)
            .post('/api/auth/signup')
            .send({
                name: testUserCredentials.userName,
                email: testUserCredentials.userEmail,
                password: testUserCredentials.userPassword,
            })
            .expect(201);

        expect(response.body.user).toBeDefined();
        expect(response.body.user.name).toBe(userName);
        expect(response.body.user.email).toBe(userEmail);
        expect(response.body.user.roles).toEqual(
            expect.arrayContaining(['USER'])
        );
        expect(response.body.token).toBeDefined();
        expect(response.body.user.active).toBe(!REQUIRE_ACTIVATION);
        token = response.body.token;
        userId = response.body.user._id;
    });

    it('should return 400 if required fields are missing', async () => {
        await request(app).post('/api/auth/signup').send({}).expect(400);
    });
});
