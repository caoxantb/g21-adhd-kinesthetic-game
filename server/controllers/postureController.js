import { Posture } from "../models/index.js";
import { NotFound } from "../utils/httpError.js";

export const getAllPostures = async (req, res) => {
  const postures = await Posture.find();
  res.status(200).json(postures);
};

export const getPostureById = async (req, res) => {
  const { id } = req.params;
  const posture = await Posture.findById(id);
  if (!posture) {
    throw new NotFound("Posture with id not found");
  }
  res.status(200).json(posture);
};
