import express from "express";
import { getAllFrames, getFrameById, getRandomFrameForLevel } from "../controllers/frameController.js";

const frameRouter = new express.Router();

frameRouter.route("/").get(getAllFrames);
frameRouter.route("/:id").get(getFrameById);
frameRouter.route("/level/:levelId").get(getRandomFrameForLevel);

export default frameRouter;