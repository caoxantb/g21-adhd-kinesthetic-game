import Gameplay from "../models/gameplayModel.js";
import User from "../models/userModel.js";

import { NotFound, Unauthorized, Forbidden } from "../utils/httpError.js";

// Save a new gameplay session
export const saveGameplay = async (req, res) => {
  const { level, score, ...rest } = req.body;

  if (!req.user) {
    throw new Unauthorized("You must be logged in to save a gameplay.");
  }

  const user = await User.findOne({ username: req.user.username });

  const pastGameplayForCurrentLevel = await Gameplay.find({
    player: user.username,
    level,
  })
    .sort({ score: -1 })
    .limit(1);

  if (!pastGameplayForCurrentLevel.length) {
    user.currentLevel = level;
    user.totalScore += score;
  } else {
    user.totalScore += Math.max(
      score - pastGameplayForCurrentLevel[0].score,
      0,
    );
  }

  await user.save();

  const newGameplay = new Gameplay({
    ...req.body,
    player: user.username,
  });

  const savedGameplay = await newGameplay.save();

  res.status(201).json(savedGameplay);
};

// Get gameplay by ID
export const getGameplayById = async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new Unauthorized("You must be logged in to access this data.");
  }

  const gameplay = await Gameplay.findById(req.params.id);

  if (!gameplay) {
    throw new NotFound("Gameplay not found");
  }

  if (user.role !== "admin" && user.username !== gameplay?.player) {
    throw new Forbidden("You do not have a permission to access this data.");
  }

  res.status(200).json(gameplay);
};

// Get all gameplays by player
export const getGameplaysByPlayer = async (req, res) => {
  const user = req.user;

  if (!user) {
    throw new Unauthorized("You must be logged in to access this data.");
  }

  const gameplays = await Gameplay.find({ player: req.params.username });

  if (gameplays.length === 0) {
    throw new NotFound("No gameplays found for this player.");
  }

  if (user.role !== "admin" && user.username !== gameplay?.player) {
    throw new Forbidden("You do not have a permission to access this data.");
  }

  res.status(200).json(gameplays);
};

// Get all gameplays by level
export const getGameplaysByLevel = async (req, res) => {
  const gameplays = await Gameplay.find({ level: req.params.levelId });

  if (gameplays.length === 0) {
    throw new NotFound("No gameplays found for this level");
  }

  res.status(200).json(gameplays);
};
