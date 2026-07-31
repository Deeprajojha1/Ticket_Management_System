import "dotenv/config";
import mongoose from "mongoose";
import app from "./app.js";
import connectDatabase from "./config/database.js";

const port = process.env.SMOKE_TEST_PORT || 5055;

let server;

try {
  await connectDatabase();

  server = app.listen(port);
  const response = await fetch(`http://127.0.0.1:${port}/health`);
  const payload = await response.json();

  if (!response.ok || payload.success !== true) {
    throw new Error(`Health check failed with status ${response.status}`);
  }

  console.log("Smoke test passed");
  console.log(JSON.stringify(payload));
} finally {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }

  await mongoose.connection.close(false);
}
