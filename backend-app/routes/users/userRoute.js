const express = require('express');
const swaggergenerator = require("../../utils/swagger/swaggergenerator");
const userController = require("../../controllers/userController");
const router = express.Router();

router.route("/me")
    .get(userController.getMe)
    .delete(userController.deleteMe)
    .patch(userController.updateMe)

userRoutes = (mainrouter) => {
    swaggergenerator.register("user", "./routes/users/userRoute.js");
    mainrouter.use("/users", router);
}
    
    
module.exports = userRoutes;
