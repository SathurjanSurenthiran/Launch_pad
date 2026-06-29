import authService from "../services/auth.service.js";
import ApiResponse from "../utils/api-response.js";
import env from "../config/env.js";

// Helper to convert env JWT_EXPIRES_IN (e.g. "7d", "24h") to milliseconds for cookie maxAge
const parseExpiryToMs = (str) => {
  const num = parseFloat(str);
  const unit = str.replace(String(num), "").trim().toLowerCase();
  switch (unit) {
    case "d": return num * 24 * 60 * 60 * 1000;
    case "h": return num * 60 * 60 * 1000;
    case "m": return num * 60 * 1000;
    case "s": return num * 1000;
    default: return num || 7 * 24 * 60 * 60 * 1000; // fallback to 7 days
  }
};

const getCookieOptions = () => ({
  httpOnly: true,
  secure: env.NODE_ENV === "production",
  sameSite: "strict",
  maxAge: parseExpiryToMs(env.JWT_EXPIRES_IN),
});

/**
 * Excludes sensitive fields (googleId, __v) from the user object.
 * @param {Object} user 
 * @returns {Object} Sanitized user object
 */
const sanitizeUser = (user) => {
  const userObj = typeof user.toObject === "function" ? user.toObject() : { ...user };
  delete userObj.googleId;
  delete userObj.__v;
  return userObj;
};

/**
 * Handles Google Login. Sets an HTTP-only cookie with JWT.
 */
export const loginWithGoogle = async (req, res, next) => {
  try {
    const { idToken, role } = req.body;
    const { user, token } = await authService.loginWithGoogle(idToken, role);

    res.cookie("token", token, getCookieOptions());

    return ApiResponse.success(res, sanitizeUser(user), "Logged in successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Returns current authenticated user profile.
 */
export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.userId);
    return ApiResponse.success(res, sanitizeUser(user), "User profile retrieved successfully");
  } catch (error) {
    next(error);
  }
};

/**
 * Clears the session cookie for logout.
 */
export const logout = async (req, res, next) => {
  try {
    const clearOptions = {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "strict",
    };
    res.clearCookie("token", clearOptions);
    return ApiResponse.success(res, null, "Logged out successfully");
  } catch (error) {
    next(error);
  }
};

export default {
  loginWithGoogle,
  getMe,
  logout,
};
