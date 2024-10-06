import express from "express";
import { getAllFrames, getFrameById, getAllFramesForLevel } from "../controllers/frameController.js";

const frameRouter = new express.Router();

frameRouter.route("/").get(getAllFrames);
frameRouter.route("/:id").get(getFrameById);
frameRouter.route("/level/:levelId").get(getAllFramesForLevel);

export default frameRouter;