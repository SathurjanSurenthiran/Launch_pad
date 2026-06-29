import jwt from "jsonwebtoken";
import env from "../config/env.js";
import AuthenticationException from "../exceptions/authentication.exception.js";

export const generateToken = (payload) => {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, env.JWT_SECRET);
  } catch (error) {
    throw new AuthenticationException("Invalid or expired token");
  }
};

export const extractTokenFromRequest = (req) => {
  // 1. Read from cookie named "token"
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  // 2. Read from Authorization: Bearer header
  if (req.headers && req.headers.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      return parts[1];
    }
  }

  return null;
};

export default {
  generateToken,
  verifyToken,
  extractTokenFromRequest,
};
