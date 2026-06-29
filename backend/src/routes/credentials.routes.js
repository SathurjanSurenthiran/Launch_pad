import express from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";
import { strictAuthLimiter } from "../middlewares/rate-limit.middleware.js";
import ApiResponse from "../utils/api-response.js";
import credentialsService from "../services/credentials.service.js";

const router = express.Router();

// Helper to convert env JWT_EXPIRES_IN (e.g. "7d", "24h") to milliseconds for cookie maxAge
const parseExpiryToMs = (str) => {
  const num = parseFloat(str || "7d");
  const unit = str.replace(String(num), "").trim().toLowerCase();
  switch (unit) {
    case "d": return num * 24 * 60 * 60 * 1000;
    case "h": return num * 60 * 60 * 1000;
    case "m": return num * 60 * 1000;
    case "s": return num * 1000;
    default: return num || 7 * 24 * 60 * 60 * 1000;
  }
};

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: parseExpiryToMs(process.env.JWT_EXPIRES_IN),
});

const sanitizeUser = (user) => {
  const userObj = typeof user.toObject === "function" ? user.toObject() : { ...user };
  delete userObj.password;
  delete userObj.googleId;
  delete userObj.__v;
  delete userObj.resetPasswordToken;
  delete userObj.resetPasswordExpires;
  return userObj;
};

// POST /api/auth/login
router.post("/auth/login", strictAuthLimiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await credentialsService.login(email, password);

    res.cookie("token", token, getCookieOptions());
    return ApiResponse.success(res, sanitizeUser(user), "Logged in successfully");
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/register
router.post("/auth/register", strictAuthLimiter, async (req, res, next) => {
  try {
    const { user, token } = await credentialsService.register(req.body);

    res.cookie("token", token, getCookieOptions());
    return ApiResponse.created(res, sanitizeUser(user), "Registered successfully");
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/forgot-password
router.post("/auth/forgot-password", strictAuthLimiter, async (req, res, next) => {
  try {
    const { email } = req.body;
    const { resetLink, resetToken } = await credentialsService.forgotPassword(email);
    
    // In dev, return link in body so testers can copy/paste it instantly
    return ApiResponse.success(res, { resetLink, resetToken }, "Password reset link generated successfully");
  } catch (error) {
    next(error);
  }
});

// POST /api/auth/reset-password/:token
router.post("/auth/reset-password/:token", strictAuthLimiter, async (req, res, next) => {
  try {
    const { password } = req.body;
    const { token } = req.params;
    await credentialsService.resetPassword(token, password);
    return ApiResponse.success(res, null, "Password reset successfully");
  } catch (error) {
    next(error);
  }
});

// POST /api/admin/recruiters
router.post("/admin/recruiters", authenticate, authorize("ADMIN"), async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const { user, plainPassword } = await credentialsService.createRecruiter(req.user.userId, { name, email });
    return ApiResponse.created(res, { user: sanitizeUser(user), plainPassword }, "Recruiter created successfully");
  } catch (error) {
    next(error);
  }
});

export default router;
