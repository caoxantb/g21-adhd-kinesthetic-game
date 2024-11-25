import express from "express";
import {
  saveGameplay,
  getGameplayById,
  getGameplaysByPlayer,
  getGameplayLeaderboars,
} from "../controllers/gameplayController.js";

const router = express.Router();

router.post("/", saveGameplay);
router.get("/leaderboards", getGameplayLeaderboars);
router.get("/:id", getGameplayById);
router.get("/player/:username", getGameplaysByPlayer);

export default router;
