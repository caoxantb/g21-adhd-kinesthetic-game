import { Level } from "../models/index.js";
import { NotFound } from "../utils/httpError.js";

export const getLevels = async (req, res) => {
  const levels = await Level.find();
  res.status(200).json(levels);
  if (!levels) {
    throw new NotFound("No levels found");
  }
};

export const getLevelById = async (req, res) => {
    const { id } = req.params;
    const level = await Level.findById(id);
    res.status(200).json(level);
    if (!level) {
        throw new NotFound("Level with id not found");
    }
};
