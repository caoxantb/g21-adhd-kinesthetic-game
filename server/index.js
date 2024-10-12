import http from "http";
import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import { connectDatabase } from "./db/connection.js";

const initServer = async () => {
  const server = http.createServer(app);
  const PORT = process.env.PORT || 8080;

  await connectDatabase();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

initServer();
