const request = require('supertest');
const app = require('../../../app');
const { testUserCredentials } = require('../../testConstants');
const { createUser, loginUser, deleteUser } = require('../../utils');
const { REQUIRE_ACTIVATION } = require('../../../config/app_config');
describe('PATCH /api/users/me', () => {
    // if user is not logged in
    // console.log('db connected: ', mongoose.connection.readyState);
    let accessToken;
    beforeAll(async () => {
        await createUser(
            app,
            testUserCredentials.userName,
            testUserCredentials.userEmail,
            testUserCredentials.userPassword
        );
        const res = await loginUser(
            app,
            testUserCredentials.userEmail,
            testUserCredentials.userPassword
        );
        accessToken = res.body.accessToken;
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
    afterAll(async () => {
        await deleteUser(
            app,
            testUserCredentials.userEmail,
            testUserCredentials.userPassword
        );
    });
});
describe('DELETE /api/users/me', () => {
    let accessToken;
    beforeAll(async () => {
        await createUser(
            app,
            testUserCredentials.userName,
            testUserCredentials.userEmail,
            testUserCredentials.userPassword
        );
        const res = await loginUser(
            app,
            testUserCredentials.userEmail,
            testUserCredentials.userPassword
        );
        accessToken = res.body.accessToken;
    });
    it('should delete the user if user is logged in', async () => {
        await request(app)
            .delete('/api/users/me')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(204);
    });
    afterAll(async () => {
        await deleteUser(
            app,
            testUserCredentials.userEmail,
            testUserCredentials.userPassword
        );
    });
});

if (REQUIRE_ACTIVATION)
    describe('Account Activation : GET /api/auth/activate', () => {
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
