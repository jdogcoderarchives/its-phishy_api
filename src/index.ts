import mongoose from "mongoose";
import "dotenv/config";

import app from "./app";
import * as logger from "./utils/logger";
import { validateEnv } from "./utils/validateEnv";

const PORT = process.env.PORT;

void (async () => {
  const validatedEnvironment = validateEnv();
  if (!validatedEnvironment.valid) {
    logger.error(validatedEnvironment.message);
    return;
  } else {
    logger.info("Environment variables validated.");
  }

  logger.db("Connecting to MongoDB...");
  mongoose.set('strictQuery', true)
  const connection = await mongoose.connect(process.env.MONGODB_URI as string);

  if (!connection) {
    logger.error("Failed to connect to MongoDB.");
    process.exit(1);
  }

  logger.db("Connected to MongoDB.");

  mongoose.connection.on("error", (err) => {
    logger.error(err);
  });

  const application = app.listen(PORT, () => {
    logger.ready(`API running at http://localhost:${PORT}`);
  });

  if (!application || !connection) {
    logger.error("Error starting API");
    process.exit(1);
  }
})();
