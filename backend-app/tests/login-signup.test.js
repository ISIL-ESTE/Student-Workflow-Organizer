require("dotenv").config();
require("../utils/Logger");
const mongoose = require("mongoose");
const request = require("supertest");
const app = require("../app");
const createRoles = require("../utils/authorization/role/createRoles");

beforeAll(async () => {
  await mongoose.connect("mongodb://localhost:27017/testdb", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  await createRoles();
  await request(app).post("/api/v1/users/signup").send({
    name: "Admin",
    email: "admin@gmail.com",
    password: "admin123",
  });
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();
});

describe("User API", () => {
  let token;

  beforeEach(async () => {
    const response = await request(app).post("/api/v1/users/login").send({
      email: "admin@gmail.com",
      password: "admin123",
    });
    token = response.body.token;
  });

  describe("POST /api/v1/users/signup", () => {
    it("should create a new user", async () => {
      const response = await request(app)
        .post("/api/v1/users/signup")
        .send({
          name: "John Doe",
          email: "johndoe@gmail.com",
          password: "sfklashfjksdf@#$#@$sdc",
        })
        .expect(201);

      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.name).toBe("John Doe");
      expect(response.body.data.user.email).toBe("johndoe@gmail.com");
      expect(response.body.data.user.roles).toEqual(
        expect.arrayContaining(["USER"])
      );
      expect(response.body.token).toBeDefined();
    });

    it("should return 400 if required fields are missing", async () => {
      await request(app)
        .post("/api/v1/users/signup")
        .send({})
        .expect(400);
    });
  });

  describe("POST /api/v1/users/login", () => {
    it("should return a JWT token on successful login", async () => {
      const response = await request(app)
        .post("/api/v1/users/login")
        .send({
          email: "johndoe@gmail.com",
          password: "sfklashfjksdf@#$#@$sdc",
        })
        .expect(200);
      expect(response.body.token).toBeDefined();
    });

    it("should return 401 if invalid credentials are provided", async () => {
      await request(app)
        .post("/api/v1/users/login")
        .send({
          email: "user@example.com",
          password: "incorrect_password",
        })
        .expect(401);
    });
  });
});
