const request = require('supertest');
const app = require('../../../app');
const { testUserCredentials } = require('../../testConstants');

describe('PATCH /api/users/me', () => {
    // if user is not logged in
    let token;
    beforeAll(async () => {
        const response = await request(app).post('/api/auth/login').send({
            email: testUserCredentials.userEmail,
            password: testUserCredentials.userPassword,
        });
        token = response.body.token;
    });
    it('should return 401 if user is not logged in', async () => {
        await request(app)
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
            .set('Authorization', `Bearer ${token}`)
            .send({
                name: 'John Doe',
            })
            .expect(200);
    });
    // if user tries to update password
    it('should return 400 if user tries to update password', async () => {
        await request(app)
            .patch('/api/users/me')
            .set('Authorization', `Bearer ${token}`)
            .send({
                password: '123456789',
            })
            .expect(400);
    });
    // if user tries to update roles
    it('should return 400 if user tries to update roles', async () => {
        await request(app)
            .patch('/api/users/me')
            .set('Authorization', `Bearer ${token}`)
            .send({
                roles: ['ADMIN'],
            })
            .expect(400);
    });
});
describe('DELETE /api/users/me', () => {
    let token;
    beforeAll(async () => {
        const response = await request(app).post('/api/auth/login').send({
            email: 'admin@gmail.com',
            password: 'admin123',
        });
        token = response.body.token;
    });
    it('should return 401 if user is not logged in', async () => {
        await request(app).delete('/api/users/me').expect(401);
    });
    // if user is logged in
    it('should delete the user if user is logged in', async () => {
        await request(app)
            .delete('/api/users/me')
            .set('Authorization', `Bearer ${token}`)
            .expect(204);
        // recreate the user
        await request(app).post('/api/users/signup').send({
            name: 'Admin',
            email: 'admin@gmail.com',
            password: 'admin123',
        });
    });
});
