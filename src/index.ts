import { createServer } from "http";
import mongoose from "mongoose";
import { Server } from "socket.io";
import "dotenv/config";

import app from "./app";
import { LinkModel } from "./database/models/Link.schema";
import * as logger from "./utils/logger";
import { validateEnv } from "./utils/validateEnv";

const API_PORT = process.env.API_PORT;

void (async () => {
  const validatedEnvironment = validateEnv();
  if (!validatedEnvironment.valid) {
    logger.error(validatedEnvironment.message);
    return;
  } else {
    logger.info("Environment variables validated.");
  }

  logger.db("Connecting to MongoDB...");
  mongoose.set("strictQuery", true);
  const connection = await mongoose.connect(process.env.MONGO_URI as string);

  if (!connection) {
    logger.error("Failed to connect to MongoDB.");
    process.exit(1);
  }

  logger.db("Connected to MongoDB.");

  mongoose.connection.on("error", (err) => {
    logger.error(err);
  });

  const httpServer = createServer(app);
  const io = new Server(httpServer, {
    /* options */
  });

  // const secretKey = process.env.SECRET_KEY as string;

  // Define a namespace for endpoint 1
  const endpoint1 = io.of("/db-change-streams");

  endpoint1.on("connection", (client) => {
    console.log("Client connected");

    // Set up a change stream on the Link model
    const changeStream = LinkModel.watch();

    // When a change is detected, send it to all connected clients (speify change type)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    changeStream.on("change", (change: any) => {
      // if change is an insert, send the new document

      if (change.operationType === "insert") {
        const newLink = change.fullDocument;

        const link = newLink.link;
        client.emit("link", "+ " + `${link}`);

        client.emit("link-added", {
          id: newLink.id,
          link: newLink.link,
        });
      }

      // if change is a delete, send the id of the deleted document
      if (change.operationType === "delete") {
        const deletedLink = change.fullDocument;

        const link = deletedLink.link;
        client.emit("link", "- " + `${link}`);

        client.emit("link-deleted", {
          id: deletedLink.id,
          link: deletedLink.link,
        });
      }
    });

    // Clean up change stream when client disconnects
    client.on("disconnect", () => {
      changeStream.close();
    });
  });

  const application = httpServer.listen(API_PORT, () => {
    logger.ready(`API listening on port ${API_PORT}`);
    logger.plain("Press Ctrl+C to quit.");
  });

  if (!application) {
    logger.error("Error starting API || Missing Application");
    process.exit(1);
  }

  if (!connection) {
    logger.error("Error starting API || Missing DB Connection");
    process.exit(1);
  }
})();
