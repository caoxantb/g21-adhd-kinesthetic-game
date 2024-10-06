import { Frame, Level } from "../models/index.js";
import { NotFound } from "../utils/httpError.js";

export const getAllFrames = async (req, res) => {
    const frames = await Frame.find();
    if (!frames) {
        throw new NotFound("No frames found");
    }
    res.status(200).json(frames);
};

export const getFrameById = async (req, res) => {
    const { id } = req.params;
    const frame = await Frame.findById(id);
    if (!frame) {
        throw new NotFound("Frame with id not found");
    }
    res.status(200).json(frame);
};

export const getAllFramesForLevel = async (req, res) => {
    const { levelId } = req.params;
    const level = await Level.findById(levelId); 
    if (!level) throw new NotFound("Level does not exist"); // if the level does not exist in the database
    else {
        const frames = await Frame.find({ difficultyLevel: { $in: [levelId] } }); 
        if (frames.length === 0) {
            throw new NotFound("No frames found"); // if the level does not have any frames
        }
        res.status(200).json(frames); 
    }
};
