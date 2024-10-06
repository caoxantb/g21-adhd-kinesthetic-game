import express from "express";
import { getLevels, getLevelById } from "../controllers/levelController.js";

const levelRouter = new express.Router();

levelRouter.route("/").get(getLevels);
levelRouter.route("/:id").get(getLevelById);

export default levelRouter;
