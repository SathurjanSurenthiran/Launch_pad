import logger from "../utils/logger.js";
import AppException from "../exceptions/app.exceptions.js";
import env from "../config/env.js";
import { HTTP_STATUS } from "../constants/http-status.js";

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || null;

  // Handle Mongoose ValidationError
  if (err.name === "ValidationError") {
    statusCode = HTTP_STATUS.UNPROCESSABLE_ENTITY; // 422
    message = "Validation Error";
    errors = Object.keys(err.errors).reduce((acc, key) => {
      acc[key] = err.errors[key].message;
      return acc;
    }, {});
  }

  // Handle Mongoose duplicate key error (11000)
  else if (err.code === 11000) {
    statusCode = HTTP_STATUS.CONFLICT; // 409
    const field = Object.keys(err.keyValue || {})[0] || "field";
    message = `Duplicate field value entered: ${field}`;
    errors = { [field]: `${field} already exists` };
  }

  // Handle JWT errors
  else if (err.name === "JsonWebTokenError") {
    statusCode = HTTP_STATUS.UNAUTHORIZED; // 401
    message = "Invalid token. Please log in again.";
  } else if (err.name === "TokenExpiredError") {
    statusCode = HTTP_STATUS.UNAUTHORIZED; // 401
    message = "Your token has expired. Please log in again.";
  }

  // Handle Multer upload errors
  else if (err.name === "MulterError") {
    statusCode = HTTP_STATUS.BAD_REQUEST; // 400
    message = `File upload failed: ${err.message}`;
    errors = { [err.field || "file"]: err.message };
  }

  // Handle custom AppExceptions
  else if (err instanceof AppException) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors || null;
  }

  // Log 5xx errors using winston
  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} - ${err.message}`, { stack: err.stack });
    
    // In production, never leak 5xx details
    if (env.NODE_ENV === "production") {
      message = "An unexpected error occurred on the server";
    }
  }

  const responseBody = {
    success: false,
    message,
    ...(errors && { errors }),
    ...(env.NODE_ENV !== "production" && { stack: err.stack }),
  };

  return res.status(statusCode).json(responseBody);
};

export default errorMiddleware;
