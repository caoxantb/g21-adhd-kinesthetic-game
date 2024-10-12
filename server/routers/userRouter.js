import express from "express";
import {
  userLogin,
  userRegister,
  userLogout,
  getUserByUsername,
  getCurrentUser,
  getUserLeaderboards,
  updateUser,
} from "../controllers/userController.js";

const userRouter = new express.Router();

userRouter.route("/register").post(userRegister);
userRouter.route("/login").post(userLogin);
userRouter.route("/logout").post(userLogout);
userRouter.route("/current").get(getCurrentUser);
userRouter.route("/leaderboards").get(getUserLeaderboards);
userRouter.route("/:username").get(getUserByUsername).put(updateUser);

export default userRouter;
