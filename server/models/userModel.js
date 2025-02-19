import mongoose from "mongoose";
import uniqueValidator from "mongoose-unique-validator";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      min: 0,
    },
    avatar: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "player"],
      default: "player",
    },
    totalScore: {
      type: Number,
      default: function () {
        return this.role === "player" ? 0 : null;
      },
      min: 0,
    },
    gameplaySettings: {
      type: {
        numberOfBlocks: { type: Number, min: 2, default: 4 },
        blockJumpingDurations: { type: [Number], default: [60, 60, 60, 60] },
        blockPosingDurations: { type: [Number], default: [10, 20, 30, 40] },
      },
    },
  },
  {
    timestamps: true,
  },
);

// Add the unique validator plugin to the schema
userSchema.plugin(uniqueValidator);
userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    delete returnedObject.passwordHash;
  },
});

const User = mongoose.model("User", userSchema);

export default User;
