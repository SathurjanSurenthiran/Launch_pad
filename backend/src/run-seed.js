import { connect } from "./config/database.js";
import seedDatabase from "./config/seed.js";
import mongoose from "mongoose";
import logger from "./utils/logger.js";

const run = async () => {
  try {
    await connect();
    logger.info("Connected to database, running seed...");
    await seedDatabase();
    logger.info("Seed completed.");
  } catch (error) {
    logger.error("Seed failed: " + error.message);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

run();
