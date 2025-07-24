const userController = require("../controllers/userController");
const {Router} = require("express");
const userRouter = Router();



userRouter.get("/", userController.getUser);
userRouter.post("/register", userController.register);
userRouter.post("/login", userController.login);

module.exports = userRouter