import express from "express";
import {
  saveGameplay,
  getGameplayById,
  getGameplaysByPlayer,
} from "../controllers/gameplayController.js";

const router = express.Router();

// POST to save gameplay
router.post("/", saveGameplay);

// GET gameplay by ID
router.get("/:id", getGameplayById);

// GET all gameplays by player
router.get("/player/:username", getGameplaysByPlayer);

export default router;
