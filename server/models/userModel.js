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
    currentLevel: {
      type: Number,
      default: function () {
        return this.role === "player" ? 1 : null;
      },
      min: 1,
    },
    totalScore: {
      type: Number,
      default: function () {
        return this.role === "player" ? 0 : null;
      },
      min: 0,
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
