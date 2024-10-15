import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const levelSchema = new mongoose.Schema(
  {
    _id: {
      type: Number,
      min: 1,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    theme: {
      type: String,
      required: true,
      trim: true,
    },
    timeLimit: {
      type: Number,
      required: true,
      min: 0,
    },
    maximumScore: {
      type: Number,
      required: true,
      min: 0,
    },
    numberOfMovements: {
      type: Number,
      required: true,
      min: 0,
    },
    numberOfFreezes: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Add the unique validator plugin to the schema
levelSchema.plugin(uniqueValidator);

const Level = mongoose.model("Level", levelSchema);

export default Level;
