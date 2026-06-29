import { extractTokenFromRequest, verifyToken } from "../utils/jwt.js";
import AuthenticationException from "../exceptions/authentication.exception.js";
import AuthorizationException from "../exceptions/authorization.exception.js";

/**
 * Authentication middleware that verifies the JWT token and attaches user information to req.user.
 */
export const authenticate = (req, res, next) => {
  try {
    const token = extractTokenFromRequest(req);
    if (!token) {
      throw new AuthenticationException("Access token is missing or invalid");
    }

    const decoded = verifyToken(token);
    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      email: decoded.email,
      staffVerified: !!decoded.staffVerified,
    };
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorization middleware factory that checks if the authenticated user's role is allowed.
 * Treat unverified RECRUITER (staffVerified=false) as a STUDENT.
 * @param {...string} roles 
 * @returns {Function} Express middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        throw new AuthenticationException("User is not authenticated");
      }

      let effectiveRole = req.user.role;
      // Treat unverified RECRUITER as STUDENT
      if (effectiveRole === "RECRUITER" && !req.user.staffVerified) {
        effectiveRole = "STUDENT";
      }

      if (!roles.includes(effectiveRole)) {
        throw new AuthorizationException("Not authorized to access this resource");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Optional authentication middleware that attempts to verify token but does not fail if missing or invalid.
 */
export const optionalAuthenticate = (req, res, next) => {
  try {
    const token = extractTokenFromRequest(req);
    if (token) {
      const decoded = verifyToken(token);
      req.user = {
        userId: decoded.userId,
        role: decoded.role,
        email: decoded.email,
        staffVerified: !!decoded.staffVerified,
      };
    } else {
      req.user = null;
    }
    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

export default {
  authenticate,
  optionalAuthenticate,
  authorize,
};
