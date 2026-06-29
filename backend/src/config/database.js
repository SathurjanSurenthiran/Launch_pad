import mongoose from "mongoose";
import env from "./env.js";
import logger from "../utils/logger.js";

export const connect = async () => {
  try {
    // Enable debug logging only in development
    mongoose.set("debug", process.env.NODE_ENV === "development");

    // Add connection event listeners
    mongoose.connection.on("connected", () => {
      logger.info("MongoDB connection established successfully");
    });

    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB connection disconnected");
    });

    // Connection configuration for scalability
    const options = {
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
    };

    await mongoose.connect(env.MONGODB_URI, options);
  } catch (error) {
    logger.error(`Failed to connect to MongoDB: ${error.message}`);
    throw error;
  }
};

export default connect;