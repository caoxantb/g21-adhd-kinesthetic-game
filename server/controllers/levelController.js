import { Level } from "../models/index.js";
import { NotFound } from "../utils/httpError.js";

export const getLevels = async (req, res) => {
    const levels = await Level.find();
    if (!levels) {
        throw new NotFound("No levels found");
    }
    res.status(200).json(levels);
};

export const getLevelById = async (req, res) => {
    const { id } = req.params;
    const level = await Level.findById(id);
    if (!level) {
        throw new NotFound("Level with id not found");
    }
    res.status(200).json(level);
};
