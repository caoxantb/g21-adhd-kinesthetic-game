import { readFile } from "fs/promises";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

import { connectDatabase, disconnectDatabase } from "./connection.js";
import { User, Gameplay, Posture } from "../models/index.js";

const readJsonFile = async path => {
  return JSON.parse(await readFile(new URL(path, import.meta.url)));
};

(async () => {
  connectDatabase();

  try {
    const users = await readJsonFile("./json/users.json");
    const postures = await readJsonFile("./json/postures.json");
    const gameplays = await readJsonFile("./json/gameplays.json");

    const authenticatedUsers = await Promise.all(
      users.map(async user => {
        const { password, ...rest } = user;
        const passwordHash = await bcrypt.hash(password, 10);
        return { ...rest, passwordHash };
      }),
    );

    await User.deleteMany();
    await Gameplay.deleteMany();
    await Posture.deleteMany();

    await User.create(authenticatedUsers);
    await Posture.create(postures);
    await Gameplay.create(gameplays);

  } catch (err) {
    console.error(err);
  } finally {
    disconnectDatabase();
  }
})();
