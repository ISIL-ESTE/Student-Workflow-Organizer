require('dotenv').config();
require('../../utils/logger');
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../../app');
const createRoles = require('../../utils/authorization/role/create_roles');
const createDefaultUser = require('../../utils/create_default_user');
const { REQUIRE_ACTIVATION } = require('../../config/app_config');
const user_model = require('../../models/user_model');
const { log } = require('winston');
beforeAll(async () => {
  mongoose.set("strictQuery", false);
  await mongoose.connect(process.env.MONGO_URI_TEST, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await createRoles();
  await createDefaultUser();
  await request(app).post('/api/v1/auth/signup').send({
    name: 'Admin',
    email: 'admin@gmail.com',
    password: 'admin123',
  });
});

afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
});

describe('User API', () => {
  let userEmail = "user@gmail.com"
  let userPassword = "user123"
  let userName = "John Doe"
  let userId;
  let token;

  

  describe('POST /api/v1/auth/signup', () => {
    it('should create a new user', async () => {
      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send({
          name: userName,
          email: userEmail,
          password: userPassword,
        })
        .expect(201);

      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.name).toBe(userName);
      expect(response.body.data.user.email).toBe(userEmail);
      expect(response.body.data.user.roles).toEqual(
        expect.arrayContaining(['USER'])
      );
      expect(response.body.token).toBeDefined();
      expect(response.body.data.user.active).toBe(!REQUIRE_ACTIVATION);
      token = response.body.token;
      userId = response.body.data.user._id;
    });

    it('should return 400 if required fields are missing', async () => {
      await request(app).post('/api/v1/auth/signup').send({}).expect(400);
    });
  });
  REQUIRE_ACTIVATION && describe("GET /api/v1/auth/activate", () => {
    let user;
    let activationKey;
    beforeAll(async () => {
      user = await user_model
        .findOne({ email: userEmail })
        .select("+activationKey");
      activationKey = user.activationKey;
    });
    it("should return 400 if activation key is missing", async () => {
      const response = await request(app)
        .get("/api/v1/auth/activate")
        .query({})
        .expect(400);
    });
    it("should return 400 if id is missing", async () => {
      const response = await request(app)
        .get("/api/v1/auth/activate")
        .query({ activationKey: activationKey })
        .expect(400);
    });
    it("should return 400 if id is invalid", async () => {
      const response = await request(app)
        .get("/api/v1/auth/activate")
        .query({ activationKey: activationKey, id: "invalid_id" })
        .expect(400);
    });
    // if user not found
    it("should return 404 if user is not found", async () => {
      const response = await request(app)
        .get("/api/v1/auth/activate")
        .query({ activationKey: activationKey, id: "5f9b3b3b3b3b3b3b3b3b3b3b" })
        .expect(404);
    });
    it("should return 400 if activation key is invalid", async () => {
      const response = await request(app)
        .get("/api/v1/auth/activate")
        .query({ activationKey: "invalid_key", id: userId })
        .expect(400);
    });
    it("should return 200 if activation key is valid", async () => {
      const response = await request(app)
        .get("/api/v1/auth/activate")
        .query({ activationKey: activationKey, id: userId })
        .expect(200);
    });
    it("should return 409 if user is already activated", async () => {
      const response = await request(app)
        .get("/api/v1/auth/activate")
        .query({ activationKey: activationKey, id: userId })
        .expect(409);
    });
  });



  describe('POST /api/v1/auth/login', () => {
    it('should return a JWT token on successful login', async () => {
      const response = await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: userEmail,
          password: userPassword,
        })
        .expect(200);
      expect(response.body.token).toBeDefined();
    });

    it('should return 401 if invalid credentials are provided', async () => {
      await request(app)
        .post("/api/v1/auth/login")
        .send({
          email: "random@gmail.com",
          password: "admin123424",
        })
        .expect(401);
    });
  });
  describe('PATCH /api/v1/users/me', () => {
    // if user is not logged in
    let token;
    beforeAll(async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: userEmail,
        password: userPassword,
      });
      token = response.body.token;
      console.log(response.body);
    });
    it("should return 401 if user is not logged in", async () => {
      await request(app)
        .patch("/api/v1/users/me")
        .send({
          name: "John Doe",
          email: "abdo@gmail.com",
        })
        .expect(401);
    });
    // if user is logged in
    it("should update the user if user is logged in", async () => {
      console.log(token);
      await request(app)
        .patch("/api/v1/users/me")
        .set("Authorization", `Bearer ${token}`)
        .send({
          name: "John Doe",
        })
        .expect(200)
    });
    // if user tries to update password
    it("should return 400 if user tries to update password", async () => {
      await request(app)
        .patch("/api/v1/users/me")
        .set("Authorization", `Bearer ${token}`)
        .send({
          password: "123456789",
        })
        .expect(400)
    });
    // if user tries to update roles
    it("should return 400 if user tries to update roles", async () => {
      await request(app)
        .patch("/api/v1/users/me")
        .set("Authorization", `Bearer ${token}`)
        .send({
          roles: ["ADMIN"],
        })
        .expect(400);
    });
  });
  describe('DELETE /api/v1/users/me', () => {
    let token;
    beforeAll(async () => {
      const response = await request(app).post('/api/v1/auth/login').send({
        email: 'admin@gmail.com',
        password: 'admin123',
      });
      token = response.body.token;
    });
    it("should return 401 if user is not logged in", async () => {
      await request(app).delete("/api/v1/users/me").expect(401);
    });
    // if user is logged in
    it("should delete the user if user is logged in", async () => {
      await request(app)
        .delete("/api/v1/users/me")
        .set("Authorization", `Bearer ${token}`)
        .expect(204);
      // recreate the user
      await request(app).post("/api/v1/users/signup").send({
        name: "Admin",
        email: "admin@gmail.com",
        password: "admin123",
      });
    });
  });
  

    describe('POST /api/v1/auth/signup', () => {
        it('should create a new user', async () => {
            const response = await request(app)
                .post('/api/v1/auth/signup')
                .send({
                    name: userName,
                    email: userEmail,
                    password: userPassword,
                })
                .expect(201);

            expect(response.body.data.user).toBeDefined();
            expect(response.body.data.user.name).toBe(userName);
            expect(response.body.data.user.email).toBe(userEmail);
            expect(response.body.data.user.roles).toEqual(
                expect.arrayContaining(['USER'])
            );
            expect(response.body.token).toBeDefined();
            expect(response.body.data.user.active).toBe(!REQUIRE_ACTIVATION);
            token = response.body.token;
            userId = response.body.data.user._id;
        });

        it('should return 400 if required fields are missing', async () => {
            await request(app).post('/api/v1/auth/signup').send({}).expect(400);
        });
    });
    REQUIRE_ACTIVATION &&
        describe('GET /api/v1/auth/activate', () => {
            let user;
            let activationKey;
            beforeAll(async () => {
                user = await user_model
                    .findOne({ email: userEmail })
                    .select('+activationKey');
                activationKey = user.activationKey;
            });
            it('should return 400 if activation key is missing', async () => {
                const response = await request(app)
                    .get('/api/v1/auth/activate')
                    .query({})
                    .expect(400);
            });
            it('should return 400 if id is missing', async () => {
                const response = await request(app)
                    .get('/api/v1/auth/activate')
                    .query({ activationKey: activationKey })
                    .expect(400);
            });
            it('should return 400 if id is invalid', async () => {
                const response = await request(app)
                    .get('/api/v1/auth/activate')
                    .query({ activationKey: activationKey, id: 'invalid_id' })
                    .expect(400);
            });
            // if user not found
            it('should return 404 if user is not found', async () => {
                const response = await request(app)
                    .get('/api/v1/auth/activate')
                    .query({
                        activationKey: activationKey,
                        id: '5f9b3b3b3b3b3b3b3b3b3b3b',
                    })
                    .expect(404);
            });
            it('should return 400 if activation key is invalid', async () => {
                const response = await request(app)
                    .get('/api/v1/auth/activate')
                    .query({ activationKey: 'invalid_key', id: userId })
                    .expect(400);
            });
            it('should return 200 if activation key is valid', async () => {
                const response = await request(app)
                    .get('/api/v1/auth/activate')
                    .query({ activationKey: activationKey, id: userId })
                    .expect(200);
            });
            it('should return 409 if user is already activated', async () => {
                const response = await request(app)
                    .get('/api/v1/auth/activate')
                    .query({ activationKey: activationKey, id: userId })
                    .expect(409);
            });
        });

    describe('POST /api/v1/auth/login', () => {
        it('should return a JWT token on successful login', async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'admin1@gmail.com',
                    password: 'admin123',
                })
                .expect(200);
            expect(response.body.token).toBeDefined();
        });

        it('should return 401 if invalid credentials are provided', async () => {
            await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'admin1@gmail.com',
                    password: 'admin123424',
                })
                .expect(401);
        });
    });
    describe('PATCH /api/v1/users/me', () => {
        // if user is not logged in
        let token;
        beforeAll(async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'admin@gmail.com',
                    password: 'admin123',
                });
            token = response.body.token;
        });
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
    describe('DELETE /api/v1/users/me', () => {
        let token;
        beforeAll(async () => {
            const response = await request(app)
                .post('/api/v1/auth/login')
                .send({
                    email: 'admin@gmail.com',
                    password: 'admin123',
                });
            token = response.body.token;
        });
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

    // roles update tests
    // user can't update roles
    // admin can update roles of admin and users not superadmin
    // superadmin can update roles of admin and users

    // whts npm test flag for stopping tests on first failure
    // it is --bail
});
