import express from "express";
import {
  saveGameplay,
  getGameplayById,
  getGameplaysByPlayer,
  getGameplayLeaderboards,
} from "../controllers/gameplayController.js";

const router = express.Router();

router.post("/", saveGameplay);
router.get("/leaderboards", getGameplayLeaderboards);
router.get("/:id", getGameplayById);
router.get("/player/:username", getGameplaysByPlayer);

export default router;
