import winston from "winston";
import env from "../config/env.js";

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Define custom levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

// Define level colors for console
const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  debug: "blue",
};

winston.addColors(colors);

// Custom layout format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const transports = [];

// File transport (logs/app.log) - writes all logs up to debug level
transports.push(
  new winston.transports.File({
    filename: "logs/app.log",
    level: "debug",
    format: combine(
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      errors({ stack: true }),
      logFormat
    ),
  })
);

// Console transport (colorized, developer-only)
if (env.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.Console({
      level: "debug",
      format: combine(
        colorize({ all: true }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }),
        logFormat
      ),
    })
  );
}

const logger = winston.createLogger({
  levels,
  level: "debug", // default level
  transports,
});

export default logger;
