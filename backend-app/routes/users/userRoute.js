const express = require('express');
const router = express.Router();
const userController = require("../../controllers/userController");


userRoutes = (mainrouter) => {
    router.route("/me")
        .get(userController.getMe)
        .delete(userController.deleteMe)
        .patch(userController.updateMe)
    mainrouter.use("/users", router);
}
    
    
module.exports = userRoutes;
