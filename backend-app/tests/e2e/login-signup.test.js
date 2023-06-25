require('dotenv').config();
require('../../utils/logger');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');
const createRoles = require('../../utils/authorization/role/create_roles');
const createDefaultUser = require('../../utils/create_default_user');
beforeAll(async () => {
  await mongoose.connect('mongodb://localhost:27017/testdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await createRoles();
  await createDefaultUser();
  await request(app).post('/api/v1/auth/signup').send({
    name: 'Admin',
    email: 'admin1@gmail.com',
    password: 'admin123',
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe('User API', () => {
  let token;

  beforeEach(async () => {
    const response = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@gmail.com',
      password: 'admin123',
    });
    token = response.body.token;
  });

  describe('POST /api/v1/auth/signup', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          name: 'John Doe',
          email: 'johndoe@gmail.com',
          password: 'sfklashfjksdf@#$#@$sdc',
        })
        .expect(201);

      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.name).toBe('John Doe');
      expect(response.body.data.user.email).toBe('johndoe@gmail.com');
      expect(response.body.data.user.roles).toEqual(
        expect.arrayContaining(['USER'])
      );
      expect(response.body.token).toBeDefined();
    });

    it('should return 400 if required fields are missing', async () => {
      await request(app).post('/api/v1/auth/signup').send({}).expect(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should return a JWT token on successful login', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'johndoe@gmail.com',
          password: 'sfklashfjksdf@#$#@$sdc',
        })
        .expect(200);
      expect(response.body.token).toBeDefined();
    });

    it('should return 401 if invalid credentials are provided', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user@example.com',
          password: 'incorrect_password',
        })
        .expect(401);
    });
  });
  // user routes protection tests
  describe('DELETE /api/v1/users/me', () => {
    // if user is not logged in
    it('should return 401 if user is not logged in', async () => {
      await request(app).delete('/api/v1/users/me').expect(401);
    });
    // if user is logged in
    it('should delete the user if user is logged in', async () => {
      await request(app)
        .delete('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(204);
      // recreate the user
      await request(app).post('/api/v1/users/signup').send({
        name: 'Admin',
        email: 'admin@gmail.com',
        password: 'admin123',
      });
    });
  });
  describe('PATCH /api/v1/users/me', () => {
    // if user is not logged in
    it('should return 401 if user is not logged in', async () => {
      await request(app)
        .patch('/api/v1/users/me')
        .send({
          name: 'John Doe',
          email: 'abdo@gmail.com',
        })
        .expect(401);
    });
    // if user is logged in
    it('should update the user if user is logged in', async () => {
      await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'John Doe',
          email: 'abdo@gmail.com',
        })
        .expect(200);
    });
    // if user tries to update password
    it('should return 400 if user tries to update password', async () => {
      await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          password: '123456789',
        })
        .expect(400);
    });
    // if user tries to update roles
    it('should return 400 if user tries to update roles', async () => {
      await request(app)
        .patch('/api/v1/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          roles: ['ADMIN'],
        })
        .expect(400);
    });
  });

  // roles update tests
  // user can't update roles
  // admin can update roles of admin and users not superadmin
  // superadmin can update roles of admin and users
});
