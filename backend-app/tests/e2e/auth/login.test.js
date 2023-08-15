const request = require('supertest');
const app = require('../../../app');
const { testUserCredentials } = require('../../testConstants');
const { createUser, deleteUser } = require('../../utils');

describe('POST /api/auth/login', () => {
    // console.log('db connected: ', mongoose.connection.readyState);

    beforeAll(async () => {
        await createUser(
            app,
            testUserCredentials.userName,
            testUserCredentials.userEmail,
            testUserCredentials.userPassword
        );
    });

    it('should return a JWT token on successful login', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({
                email: testUserCredentials.userEmail,
                password: testUserCredentials.userPassword,
            })
            .expect(200);
        expect(response.body.accessToken).toBeDefined();
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
    afterAll(async () => {
        await deleteUser(
            app,
            testUserCredentials.userEmail,
            testUserCredentials.userPassword
        );
    });
});
