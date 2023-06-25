const authController = require("../controllers/authController");
const express = require("express");
const router = express.Router();

// make this file so i can use it with authRoutes(router) in index.js
const authRoutes = (mainrouter) => {
    router.post("/signup", authController.signup);
    router.post("/login", authController.login);
    mainrouter.use("/auth", router);
}
module.exports = authRoutes;