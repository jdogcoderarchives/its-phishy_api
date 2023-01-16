import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

import app from "./app";
import * as logger from "./utils/logger";
import { validateEnv } from "./utils/validateEnv";

const API_PORT = process.env.API_PORT;

  const validatedEnvironment = validateEnv();
  if (!validatedEnvironment.valid) {
    logger.error(validatedEnvironment.message);
    process.exit(1);
  } else {
    logger.info("Environment variables validated.");
  }

  logger.db("Connecting to Supabase...");
  const URL = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_ANON_KEY;

  if (
    !URL ||
    !KEY ||
    URL === "" ||
    KEY === "" ||
    URL === undefined ||
    KEY === undefined
  ) {
    logger.error("Missing Supabase URL or Key");
  }

  const supabaseClient = createClient(URL as string, KEY as string);
  logger.db("Connected to Supabase");


  const application = app.listen(API_PORT, () => {
    logger.ready(`API listening on port ${API_PORT}`);
    logger.plain("Press Ctrl+C to quit.");
  });

  if (!application) {
    logger.error("Error starting API || Missing Application");
    process.exit(1);
  }

  if (!supabaseClient) {
    logger.error("Error connecting to Supabase || Missing Client");
    process.exit(1);
  }

export { supabaseClient }