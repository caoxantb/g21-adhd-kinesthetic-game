import Gameplay from "../models/gameplayModel.js";
import User from "../models/userModel.js";
import { NotFound, Unauthorized, Forbidden } from "../utils/httpError.js";

export const saveGameplay = async (req, res) => {
  const { blocks, score } = req.body;

  if (!req.user) {
    throw new Unauthorized("You must be logged in to save a gameplay.");
  }

  const user = await User.findOne({ username: req.user.username });
  user.totalScore += score;
  await user.save();

  const newGameplay = new Gameplay({
    blocks,
    score,
    player: user.username,
  });
  const savedGameplay = await newGameplay.save();

  res.status(201).json(savedGameplay);
};

export const getGameplayLeaderboards = async (req, res) => { // Fixed typo here
  const { limit } = req.query;

  const gameplays = await Gameplay.find()
    .sort({ score: -1, username: 1 })
    .limit(parseInt(limit) || 10);

  res.status(200).json(gameplays);
};

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

export const getGameplaysByPlayer = async (req, res) => {
  const user = req.user;
  const { username } = req.params;

  if (!user) {
    throw new Unauthorized("You must be logged in to access this data.");
  }

  if (user.role !== "admin" && user.username !== username) {
    throw new Forbidden("You do not have a permission to access this data.");
  }

  const gameplays = await Gameplay.find({ player: username });

  res.status(200).json(gameplays);
};