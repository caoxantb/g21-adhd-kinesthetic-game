import { readFile } from "fs/promises";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
dotenv.config();

import { connectDatabase, disconnectDatabase } from "./connection";
import { User, Level, Gameplay, Frame } from "../models";

const readJsonFile = async path => {
  return JSON.parse(await readFile(new URL(path, import.meta.url)));
};

(async () => {
  connectDatabase();

  try {
    const users = await readJsonFile("./json/users.json");
    const levels = await readJsonFile("./json/levels.json");

    const authenticatedUsers = await Promise.all(
      users.map(async user => {
        const { password, ...rest } = user;
        const passwordHash = await bcrypt.hash(password, 10);
        return { ...rest, passwordHash };
      }),
    );

    await User.deleteMany();
    await Level.deleteMany();
    await Gameplay.deleteMany();
    await Frame.deleteMany();

    await User.create(authenticatedUsers);
    await Level.create(levels);
  } catch (err) {
    console.error(err);
  } finally {
    disconnectDatabase();
  }
})();
