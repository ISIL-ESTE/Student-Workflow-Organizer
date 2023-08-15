const request = require('supertest');
const app = require('../../../app');
const { testUserCredentials } = require('../../testConstants');
const { REQUIRE_ACTIVATION } = require('../../../config/app_config');
const { createUser, deleteUser } = require('../../utils');

describe('POST /api/auth/signup', () => {
    beforeAll(async () => {
        await deleteUser(
            app,
            testUserCredentials.userEmail,
            testUserCredentials.userPassword
        );
    });

    it('should create a new user', async () => {
        const response = await createUser(
            app,
            testUserCredentials.userName,
            testUserCredentials.userEmail,
            testUserCredentials.userPassword
        );
        expect(response.status).toBe(201);
        expect(response.body.user).toBeDefined();
        expect(response.body.user.name).toBe(testUserCredentials.userName);
        expect(response.body.user.email).toBe(testUserCredentials.userEmail);
        expect(response.body.user.roles).toEqual(
            expect.arrayContaining(['USER'])
        );
        expect(response.body.accessToken).toBeDefined();
        expect(response.body.user.active).toBe(!REQUIRE_ACTIVATION);
        token = response.body.token;
        userId = response.body.user._id;
    });

    afterAll(async () => {
        await deleteUser(
            app,
            testUserCredentials.userEmail,
            testUserCredentials.userPassword
        );
    });

    it('should return 400 if required fields are missing', async () => {
        await request(app).post('/api/auth/signup').send({}).expect(400);
    });
});
