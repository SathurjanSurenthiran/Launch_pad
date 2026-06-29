import rateLimit from "express-rate-limit";
import ApiResponse from "../utils/api-response.js";

/**
 * Generates a custom 429 error response handler.
 */
const customLimitHandler = (message) => {
  return (req, res) => {
    return ApiResponse.error(res, message, 429);
  };
};

// Global: 200 requests per 15 minutes per IP
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  handler: customLimitHandler("Too many requests from this IP, please try again after 15 minutes"),
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict Auth: 20 requests per 15 minutes per IP
export const strictAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  handler: customLimitHandler("Too many login attempts from this IP, please try again after 15 minutes"),
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload: 30 requests per hour per IP
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  handler: customLimitHandler("Too many file uploads from this IP, please try again after an hour"),
  standardHeaders: true,
  legacyHeaders: false,
});

export default {
  globalLimiter,
  strictAuthLimiter,
  uploadLimiter,
};
