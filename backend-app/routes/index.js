const express = require("express");
const router = express.Router();

const userRoutes = require("./users/userRoute");
const adminRoutes = require("./users/adminRoute");
const superAdminRoutes = require("./users/supperAdminRoute");
const authRoutes = require("./authRoutes");
const authController = require("../controllers/authController");

// public routes
authRoutes(router)

router.use(authController.protect);

// protected routes
userRoutes(router);
adminRoutes(router);
superAdminRoutes(router);

//welcome page with the welcome message and env

module.exports = router;
