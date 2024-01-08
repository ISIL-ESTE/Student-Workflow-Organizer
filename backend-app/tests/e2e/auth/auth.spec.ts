import chai from 'chai';
import { describe, it } from 'mocha';
import mongoose from 'mongoose';
import app from '@root/app';
import User from '@models/user/user_model';
import AuthUtils from '@utils/authorization/auth_utils';
import * as supertest from 'supertest';
const { generateAccessToken } = AuthUtils;
const agent = supertest.agent(app);
const expect = chai.expect;
import request from 'supertest';

let res: request.Response;

describe('Auth API', () => {
    describe('POST /signup', () => {
        it('should return an error if email is not provided', async () => {
            res = await agent.post('/api/auth/signup').send({
                name: 'Test User',
                password: 'password123',
            });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property(
                'message',
                'User validation failed: email: Please fill your email'
            );
        });

        it('should return an error if email is invalid', async () => {
            res = await agent.post('/api/auth/signup').send({
                name: 'Test User',
                email: 'invalidemail',
                password: 'password123',
            });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property(
                'message',
                'User validation failed: email:  Please provide a valid email'
            );
        });

        it('should return an error if password is not provided', async () => {
            res = await agent.post('/api/auth/signup').send({
                name: 'Test User',
                email: 'testuser@example.com',
            });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property(
                'message',
                'Please provide a password'
            );
        });

        it('should create a new user', async () => {
            res = await agent.post('/api/auth/signup').send({
                name: 'Test User',
                email: 'testuser@example.com',
                password: 'password123',
            });

            expect(res.status).to.equal(201);
            expect(res.body).to.have.property('accessToken');
            expect(res.body).to.have.property('user');
            expect(res.body.user).to.have.property('name', 'Test User');
            expect(res.body.user).to.have.property(
                'email',
                'testuser@example.com'
            );
            expect(res.body.user).to.not.have.property('password');
            expect(res.body.user).to.not.have.property('activationKey');
        });
    });

    afterEach(function () {
        const errorBody = res && res.body;
        if (this.currentTest.state === 'failed' && errorBody) {
            console.debug('res: ', errorBody);
        }

        res = null;
    });
    describe('POST /login', () => {
        it('should login a user', async () => {
            res = await agent.post('/api/auth/login').send({
                email: 'testuser@example.com',
                password: 'password123',
            });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('accessToken');
            expect(res.body).to.have.property('user');
            expect(res.body.user).to.have.property('name', 'Test User');
            expect(res.body.user).to.have.property(
                'email',
                'testuser@example.com'
            );
            expect(res.body.user).to.not.have.property('password');
            expect(res.body.user).to.not.have.property('activationKey');
        });

        it('should return an error if email is not provided', async () => {
            res = await agent.post('/api/auth/login').send({
                password: 'password123',
            });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property(
                'message',
                'Please provide email and password'
            );
        });

        it('should return an error if email is invalid', async () => {
            res = await agent.post('/api/auth/login').send({
                email: 'invalidemail',
                password: 'password123',
            });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property(
                'message',
                'Invalid email or password'
            );
        });

        it('should return an error if password is not provided', async () => {
            res = await agent.post('/api/auth/login').send({
                email: 'testuser@example.com',
            });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property(
                'message',
                'Please provide email and password'
            );
        });

        it('should return an error if email or password is incorrect', async () => {
            res = await agent.post('/api/auth/login').send({
                email: 'testuser@example.com',
                password: 'wrongpassword',
            });

            expect(res.status).to.equal(401);
            expect(res.body).to.have.property(
                'message',
                'Invalid email or password'
            );
        });
    });

    describe('GET /activate', () => {
        let user: any;

        // login user each time
        beforeEach(async () => {
            user = await User.findOne({ email: 'testuser@example.com' }).select(
                '+activationKey'
            );
        });

        it('should return an error if activation key is not provided', async () => {
            res = await agent.get(
                `/api/auth/activate?id=${user._id.toString()}`
            );

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property(
                'message',
                'Please provide activation key'
            );
        });

        it('should return an error if user id is not provided', async () => {
            res = await agent.get(
                `/api/auth/activate?activationKey=${user.activationKey}`
            );

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property(
                'message',
                'Please provide user id'
            );
        });

        it('should return an error if user id is invalid', async () => {
            res = await agent.get(
                `/api/auth/activate?id=invalidid&activationKey=${user.activationKey}`
            );

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property(
                'message',
                'Please provide a valid user id'
            );
        });

        it('should return an error if activation key is invalid', async () => {
            res = await agent.get(
                `/api/auth/activate?id=${user._id.toString()}&activationKey=invalidkey`
            );

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property(
                'message',
                'Invalid activation key'
            );
        });

        it('should return an error if user does not exist', async () => {
            res = await agent.get(
                `/api/auth/activate?id=${new mongoose.Types.ObjectId()}&activationKey=${
                    user.activationKey
                }`
            );

            expect(res.status).to.equal(404);
            expect(res.body).to.have.property('message', 'User does not exist');
        });

        it('should activate a user account', async () => {
            res = await agent.get(
                `/api/auth/activate?id=${user._id.toString()}&activationKey=${
                    user.activationKey
                }`
            );

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property('user');
            expect(res.body.user).to.have.property('name', 'Test User');
            expect(res.body.user).to.have.property(
                'email',
                'testuser@example.com'
            );
            expect(res.body.user).to.not.have.property('password');
            expect(res.body.user).to.not.have.property('activationKey');
            expect(res.body.user).to.have.property('active', true);
        });
        it('should return an error if user is already active', async () => {
            res = await agent.get(
                `/api/auth/activate?id=${user._id.toString()}&activationKey=${
                    user.activationKey
                }`
            );

            expect(res.status).to.equal(409);
            expect(res.body).to.have.property(
                'message',
                'User is already active'
            );
        });
    });

    describe(' GET /auth/refreshToken', () => {
        let accessToken: string;
        let refreshToken: string;

        // login user each time
        beforeEach(async () => {
            const user = await User.findOne({ email: 'testuser@example.com' });
            accessToken = AuthUtils.generateAccessToken(user._id.toString());
            refreshToken = AuthUtils.generateRefreshToken(user._id.toString());
        });

        it('should return an error if refresh token is invalid', async () => {
            res = await agent
                .get('/api/auth/refreshToken')
                .set('Cookie', `access_token=${accessToken}`)
                .set('Cookie', `refresh_token=invalidtoken; HttpOnly`);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property(
                'message',
                'Invalid refresh token'
            );
        });

        it('should return an error if refresh token is not provided', async () => {
            res = await agent
                .get('/api/auth/refreshToken')
                .set('Cookie', `access_token=${accessToken}`);

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property(
                'message',
                'You have to login to continue.'
            );
        });

        it('should refresh access token', async () => {
            // refresh token and access token to be sent in cookies
            res = await agent
                .get('/api/auth/refreshToken')
                .set('Cookie', `access_token=${accessToken}`)
                .set('Cookie', `refresh_token=${refreshToken}; HttpOnly`);

            expect(res.status).to.equal(204);
        });
    });

    describe('POST /auth/logout', () => {
        it('should logout a user', async () => {
            const user = await User.findOne({ email: 'testuser@example.com' });
            const accessToken = generateAccessToken(user._id.toString());

            res = await agent
                .get('/api/auth/logout')
                .set('Cookie', `access_token=${accessToken}`);

            expect(res.status).to.equal(204);
            const setCookieHeader = res.headers['set-cookie'];
            if (setCookieHeader) {
                const cookies = setCookieHeader.map(
                    (cookie: string) => cookie.split(';')[0]
                );
                expect(cookies).to.not.include('access_token');
                expect(cookies).to.not.include('refresh_token');
            }
        });

        it('should return an error if access token is not provided', async () => {
            res = await agent.get('/api/auth/logout');

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property(
                'message',
                'Please provide access token'
            );
        });
    });

    // delete user after all tests
    // after(async () => {
    //     await User.deleteMany({ email: 'testuser@example.com' });
    // });
});
describe('User API', () => {
    let user: any;
    let accessToken: string;
    beforeEach(async () => {
        res = await agent.post('/api/auth/login').send({
            email: 'testuser@example.com',
            password: 'password123',
        });

        user = res.body.user;
        accessToken = res.body.accessToken;
    });
    afterEach(function () {
        const errorBody = res && res.body;
        if (this.currentTest.state === 'failed' && errorBody) {
            console.debug('res: ', errorBody);
        }

        res = null;
    });

    describe('GET /api/users/me', () => {
        it('should return the current user', async () => {
            res = await agent
                .get('/api/users/me')
                .set('Cookie', `access_token=${accessToken}`);

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property(
                '_id',
                user._id.toString().toString()
            );
            expect(res.body).to.have.property('name', user.name);
            expect(res.body).to.have.property('email', user.email);
        });
    });

    describe('PATCH /api/users/me', () => {
        it('should return an error if the user tries to update their password', async () => {
            res = await agent
                .patch('/api/users/me')
                .set('Cookie', `access_token=${accessToken}`)
                .send({
                    password: 'newpassword123',
                    passwordConfirm: 'newpassword123',
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property(
                'message',
                'This route is not for password updates. Please use api/password-management/update-password'
            );
        });

        it('should return an error if the user tries to update their role', async () => {
            res = await agent
                .patch('/api/users/me')
                .set('Cookie', `access_token=${accessToken}`)
                .send({
                    roles: ['admin'],
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property(
                'message',
                'This route is not for role updates. Please use /update-role'
            );
        });

        it('should return an error if the user provides invalid data', async () => {
            res = await agent
                .patch('/api/users/me')
                .set('Cookie', `access_token=${accessToken}`)
                .send({
                    email: 'invalidemail',
                });

            expect(res.status).to.equal(400);
            expect(res.body).to.have.property(
                'message',
                'Validation failed: email:  Please provide a valid email'
            );
        });

        it('should update the current user', async () => {
            res = await agent
                .patch('/api/users/me')
                .set('Cookie', `access_token=${accessToken}`)
                .send({
                    name: 'Updated Name',
                });

            expect(res.status).to.equal(200);
            expect(res.body).to.have.property(
                '_id',
                user._id.toString().toString()
            );
            expect(res.body).to.have.property('name', 'Updated Name');

            // Check if the user was updated in the database
            const updatedUser = await User.findById(user._id.toString());
            expect(updatedUser).to.have.property('name', 'Updated Name');
        });
    });
    describe('DELETE /api/users/me', () => {
        it('should delete the current user', async () => {
            res = await agent
                .delete('/api/users/me')
                .set('Cookie', `access_token=${accessToken}`);

            expect(res.status).to.equal(204);

            // Check if the user was deleted from the database
            const deletedUser = await User.findById(user._id.toString());
            expect(deletedUser).to.not.exist;
        });
    });
});
