import express from "express";
import "express-async-errors";
import cors from "cors";
import cookieParser from "cookie-parser";

import {
  levelRouter,
  frameRouter,
  userRouter,
  gameplayRouter,
} from "./routers/index.js";

import { authenticateUser } from "./middlewares/auth.js";
import { errorHandler } from "./middlewares/error.js";

const app = express();

// cookie configurations
const cookieOptions = {
  httpOnly: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: "/",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  secure: process.env.NODE_ENV === "production",
};
const cookieSecret = process.env.COOKIE_SECRET;

app.set("cookieOptions", cookieOptions);
app.set("cookieSecret", cookieSecret);

// middlewares
app.use(cookieParser(cookieSecret, cookieOptions));
app.use(authenticateUser);
app.use(cors({ credentials: true, origin: true }));
app.use(express.json());

// routes
app.use("/api/v1/levels", levelRouter);
app.use("/api/v1/frames", frameRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/gameplays", gameplayRouter);

// error handler
app.use(errorHandler);

export default app;
