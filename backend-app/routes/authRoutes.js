const authController = require("../controllers/authController");
const swaggergenerator = require("../utils/swagger/swaggergenerator");
const express = require("express");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);


// make this file so i can use it with authRoutes(router) in index.js
const authRoutes = (mainrouter) => {
    swaggergenerator.register("auth", "./routes/authRoutes.js");
    mainrouter.use("/auth", router);
}
module.exports = authRoutes;