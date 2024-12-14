import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import { User } from "../models/index.js";
import { BadRequest, NotFound, Forbidden } from "../utils/httpError.js";

export const userLogin = async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });

  const validCredentials = !user
    ? false
    : await bcrypt.compare(password, user.passwordHash);
  if (!(user && validCredentials)) throw new BadRequest("Invalid credentials");

  const accessToken = jwt.sign({ username }, process.env.JWT_SECRET);
  res.cookie("token", accessToken, {
    ...res.app.get("cookieOptions"),
    signed: true,
  });

  res.status(201).json(user);
};

export const userRegister = async (req, res) => {
  const saltRounds = 10;
  const { username, name, role, password, age } = req.body;

  if (!username || !name || !password)
    throw new BadRequest("Missing required fields");

  const user = await User.findOne({ username });

  if (user) throw new BadRequest("User already exists");
  if (password.length <= 8)
    throw new BadRequest("Password must be at least 8 characters");

  const passwordHash = await bcrypt.hash(password, saltRounds);
  const newUser = new User({
    username,
    name,
    age,
    ...(role && { role }),
    passwordHash,
  });
  await newUser.save();

  const accessToken = jwt.sign({ username }, process.env.JWT_SECRET);
  res.cookie("token", accessToken, {
    ...res.app.get("cookieOptions"),
    signed: true,
  });

  res.status(201).json(newUser);
};

export const userLogout = async (req, res) => {
  if (!req.user) throw new BadRequest("There is no logged in user");

  res.clearCookie("token", {
    ...res.app.get("cookieOptions"),
    signed: true,
  });

  res.status(201).json({ message: "User logged out!" });
};

export const getCurrentUser = (req, res) => {
  if (!req.user) return res.json(null);

  res.json(req.user);
};

export const getUserByUsername = async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username });
  if (!user) {
    throw new NotFound("User not found");
  }

  res.json(user);
};

export const updateUser = async (req, res) => {
  const { username } = req.params;
  if (req.user?.username !== username) {
    throw new Forbidden("You do not have permission to update this user");
  }

  const user = await User.findOneAndUpdate({ username }, req.body);
  if (!user) {
    throw new NotFound("User not found");
  }

  res.json(user);
};

export const getUserLeaderboards = async (req, res) => {
  const { limit } = req.query;

  const users = await User.find()
    .sort({ score: -1, username: 1 })
    .limit(parseInt(limit) || 10);

  res.json(users);
};
