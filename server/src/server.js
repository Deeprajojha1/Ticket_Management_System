import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import connectDatabase from "./config/database.js";
import { closeRedis, connectRedis } from "./config/redis.js";
import { initializeSocket } from "./socket/socket.js";

const port = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    await connectDatabase();
    await connectRedis();

    server = app.listen(port, () => {
      console.log(`SupportDesk AI server running on port ${port}`);
    });
    initializeSocket(server);
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

const shutdown = async (signal) => {
  console.log(`${signal} received. Shutting down gracefully.`);

  if (server) {
    server.close(async () => {
      await mongoose.connection.close(false);
      await closeRedis();
      console.log("HTTP server and MongoDB connection closed.");
      process.exit(0);
    });
    return;
  }

  await mongoose.connection.close(false);
  await closeRedis();
  process.exit(0);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

process.on("unhandledRejection", (reason) => {
  console.error("Unhandled rejection:", reason);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  process.exit(1);
});

startServer();
