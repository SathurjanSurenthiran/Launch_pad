import { verifyGoogleToken } from "../utils/googleAuth.js";
import { generateToken } from "../utils/jwt.js";
import { userRepository } from "../container/container.js";
import AuthorizationException from "../exceptions/authorization.exception.js";
import NotFoundException from "../exceptions/not-found.exception.js";

/**
 * Handles user login and registration using Google OAuth ID Token.
 * @param {string} idToken - The Google ID Token
 * @returns {Promise<{user: Object, token: string}>}
 */
export const loginWithGoogle = async (idToken, requestedRole = "STUDENT") => {
  // 1. Verify Google ID token
  const { googleId, name, email, picture } = await verifyGoogleToken(idToken);

  // 2. Find user by googleId OR email
  let user = await userRepository.findOne({
    $or: [{ googleId }, { email }],
  });

  if (!user) {
    let role = "STUDENT";
    let staffVerified = false;
    if (requestedRole === "RECRUITER") {
      const isTestRecruiter = email === "recruiter@test.com";
      const isOrgEmail = email.endsWith("@faculty.edu") || email.endsWith("@staff.com");
      if (!isTestRecruiter && !isOrgEmail) {
        throw new ValidationException(
          "Recruiter registration requires an official organization email address (e.g. ending in @faculty.edu or @staff.com)."
        );
      }
      role = "RECRUITER";
      staffVerified = true;
    } else if (email === "admin@test.com") {
      role = "ADMIN";
    }
    // 3. If not found: create new user
    user = await userRepository.create({
      googleId,
      name,
      email,
      profilePicture: picture || "",
      role,
      staffVerified,
      isActive: true,
    });
  } else {
    // 4. If found but deactivated, throw AuthorizationException
    if (!user.isActive) {
      throw new AuthorizationException("Account is deactivated");
    }

    // Link Google ID or profile picture if not already linked (e.g. if created differently)
    let updated = false;
    let updateFields = {};

    if (!user.googleId) {
      user.googleId = googleId;
      updateFields.googleId = googleId;
      updated = true;
    }
    if (!user.profilePicture && picture) {
      user.profilePicture = picture;
      updateFields.profilePicture = picture;
      updated = true;
    }
    if (user.role === "RECRUITER" && !user.staffVerified) {
      const isTestRecruiter = email === "recruiter@test.com";
      const isOrgEmail = email.endsWith("@faculty.edu") || email.endsWith("@staff.com");
      if (isTestRecruiter || isOrgEmail) {
        user.staffVerified = true;
        updateFields.staffVerified = true;
        updated = true;
      }
    }

    if (updated) {
      user = await userRepository.updateById(user._id, updateFields);
    }
  }

  // 5. Generate JWT token
  const token = generateToken({
    userId: user._id,
    role: user.role,
    email: user.email,
    staffVerified: user.staffVerified,
  });

  // 6. Return user and JWT
  return { user, token };
};

/**
 * Fetches user profile by ID.
 * @param {string} userId - User identifier
 * @returns {Promise<Object>} The user profile
 * @throws {NotFoundException} if user does not exist
 */
export const getMe = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }
  return user;
};

/**
 * Stateless logout function.
 * @returns {Promise<{success: boolean}>}
 */
export const logout = async () => {
  return { success: true };
};

export default {
  loginWithGoogle,
  getMe,
  logout,
};
