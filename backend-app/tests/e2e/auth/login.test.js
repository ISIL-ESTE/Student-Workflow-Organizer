const request = require('supertest');
const app = require('../../../app');
const { testUserCredentials } = require('../../testConstants');
const mongoose = require('mongoose');

describe('POST /api/auth/login', () => {
    // console.log('db connected: ', mongoose.connection.readyState);

    it('should return a JWT token on successful login', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUserCredentials.userEmail,
                password: testUserCredentials.userPassword,
            })
            .expect(200);
        expect(response.body.accesstoken).toBeDefined();
    });

    it('should return 401 if invalid credentials are provided', async () => {
        await request(app)
            .post('/api/auth/login')
            .send({
                email: 'random@gmail.com',
                password: 'admin123424',
            })
            .expect(401);
    });
});
