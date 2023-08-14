const request = require('supertest');
const app = require('../../../app');
const { testUserCredentials } = require('../../testConstants');
const mongoose = require('mongoose');
describe('PATCH /api/users/me', () => {
    // if user is not logged in
    // console.log('db connected: ', mongoose.connection.readyState);
    let accessToken;
    console.log('sdfsdfsdf');
    beforeAll(async () => {
        const response = await request(app).post('/api/auth/login').send({
            email: testUserCredentials.userEmail,
            password: testUserCredentials.userPassword,
        });
        accessToken = response.body.accessToken;
    });
    it('should return 401 if user is not logged in', async () => {
        const res = await request(app)
            .patch('/api/users/me')
            .send({
                name: 'John Doe',
                email: 'abdo@gmail.com',
            })
            .expect(401);
    });
    // if user is logged in
    it('should update the user if user is logged in', async () => {
        await request(app)
            .patch('/api/users/me')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                name: 'John Doe',
            })
            .expect(200);
    });
    // if user tries to update password
    it('should return 400 if user tries to update password', async () => {
        await request(app)
            .patch('/api/users/me')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                password: '123456789',
            })
            .expect(400);
    });
    // if user tries to update roles
    it('should return 400 if user tries to update roles', async () => {
        await request(app)
            .patch('/api/users/me')
            .set('Authorization', `Bearer ${accessToken}`)
            .send({
                roles: ['ADMIN'],
            })
            .expect(400);
    });
});
describe('DELETE /api/users/me', () => {
    let accessToken;
    beforeAll(async () => {
        const response = await request(app).post('/api/auth/login').send({
            email: testUserCredentials.userEmail,
            password: testUserCredentials.userPassword,
        });
        accessToken = response.body.accessToken;
    });
    it('should return 401 if user is not logged in', async () => {
        await request(app).delete('/api/users/me').expect(401);
    });
});
