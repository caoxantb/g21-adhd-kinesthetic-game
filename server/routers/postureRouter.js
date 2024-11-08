import express from "express";
import {
  getAllPostures,
  getPostureById,
} from "../controllers/postureController.js";

const postureRouter = new express.Router();

postureRouter.route("/").get(getAllPostures);
postureRouter.route("/:id").get(getPostureById);

export default postureRouter;
