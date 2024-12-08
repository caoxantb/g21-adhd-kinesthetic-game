import { jest } from '@jest/globals';
import mongoose from 'mongoose';
import { Posture } from "../models/index.js";
import { NotFound } from "../utils/httpError.js";

export const getAllPostures = async (req, res) => {
  try {
    const postures = await Posture.find();
    res.status(200).json(postures);
  } catch (error) {
    console.error("Error getting all postures:", error);
    res.status(500).json({ message: "Error getting all postures" });
  }
};

export const getPostureById = async (req, res) => {
  try {
    const { id } = req.params;
    const posture = await Posture.findById(id);
    if (!posture) {
      throw new NotFound("Posture with id not found");
    }
    res.status(200).json(posture);
  } catch (error) {
    if (error instanceof NotFound) {
      res.status(404).json({ message: error.message });
    } else {
      console.error("Error getting posture by ID:", error);
      res.status(500).json({ message: "Error getting posture by ID" });
    }
  }
};