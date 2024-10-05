import { Frame } from "../models/index.js";
import { NotFound } from "../utils/httpError.js";

export const getAllFrames = async (req, res) => {
  const frames = await Frame.find();
  res.status(200).json(frames);
  if (!frames) {
    throw new NotFound("No frames found");
  }
};

export const getFrameById = async (req, res) => {
  const { id } = req.params;
  const frame = await Frame.findById(id);
  res.status(200).json(frame);
  if (!frame) {
    throw new NotFound("Frame with id not found");
  }
};

export const getRandomFrameForLevel = async (req, res) => {
    const { levelId } = req.params;
    const levelExists = await Frame.exists({ difficultyLevel: levelId });
    if (!levelExists) {
      throw new NotFound("Level does not exist");
    }
    const frames = await Frame.find({ difficultyLevel: { $in: [levelId] } }); 
    if (frames.length === 0) {
      throw new NotFound("No frames found");
    }
    const randomFrame = frames[Math.floor(Math.random() * frames.length)]; 
    res.status(200).json(randomFrame); 
  };


