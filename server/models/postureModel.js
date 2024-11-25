import mongoose from "mongoose";

const postureSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    alpha: {
      type: Number,
      required: true,
      min: 0,
      max: 180,
    },
    beta: {
      type: Number,
      required: true,
      min: 0,
      max: 180,
    },
    url: {
      type: String,
      trim: true,
    },
    handsOnOneSide: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

const Posture = mongoose.model("Posture", postureSchema);

export default Posture;
