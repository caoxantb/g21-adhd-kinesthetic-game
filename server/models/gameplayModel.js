import mongoose from "mongoose";

const gameplaySchema = new mongoose.Schema(
  {
    player: {
      type: String,
      required: true,
    },
    blocks: {
      type: [
        {
          blockId: {
            type: Number,
            required: true,
            min: 1,
          },
          jumpsSucceeded: {
            type: Number,
            required: true,
            min: 0,
          },
          jumpsFailed: {
            type: Number,
            required: true,
            min: 0,
          },
          averagePoseAccuracy: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
          },
        },
      ],
    },
    score: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      max: 200,
    },
  },
  {
    timestamps: true,
  },
);

const Gameplay = mongoose.model("Gameplay", gameplaySchema);

export default Gameplay;
