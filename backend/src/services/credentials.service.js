import bcrypt from "bcrypt";
import crypto from "crypto";
import { generateToken } from "../utils/jwt.js";
import { userRepository, activityLogRepository } from "../container/container.js";
import AuthenticationException from "../exceptions/authentication.exception.js";
import AuthorizationException from "../exceptions/authorization.exception.js";
import ConflictException from "../exceptions/conflict.exception.js";
import NotFoundException from "../exceptions/not-found.exception.js";
import ValidationException from "../exceptions/validation.exception.js";

/**
 * Generates a random secure password including uppercase, lowercase, number, and special character.
 */
const generateRandomPassword = () => {
  const length = 10;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n));
  }
  return password;
};

export const login = async (email, password) => {
  if (!email || !password) {
    throw new ValidationException("Email and password are required");
  }

  const user = await userRepository.findByEmail(email);
  if (!user || !user.password) {
    throw new AuthenticationException("Invalid email or password");
  }

  if (!user.isActive) {
    throw new AuthorizationException("Account is deactivated");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new AuthenticationException("Invalid email or password");
  }

  // Treat unverified RECRUITER as STUDENT
  if (user.role === "RECRUITER" && !user.staffVerified) {
    throw new AuthorizationException("Your recruiter account is not verified by staff");
  }

  const token = generateToken({
    userId: user._id,
    role: user.role,
    email: user.email,
    staffVerified: user.staffVerified,
  });

  return { user, token };
};

export const createRecruiter = async (adminId, { name, email }) => {
  if (!name || !email) {
    throw new ValidationException("Name and email are required");
  }

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new ConflictException("Email is already registered");
  }

  const plainPassword = generateRandomPassword();
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const recruiter = await userRepository.create({
    name,
    email,
    password: hashedPassword,
    role: "RECRUITER",
    staffVerified: true,
    isActive: true,
  });

  // Log admin activity
  await activityLogRepository.create({
    user: adminId,
    action: "ADMIN_CREATE_RECRUITER",
    entity: "User",
    entityId: recruiter._id,
    metadata: { email: recruiter.email },
  });

  return { user: recruiter, plainPassword };
};

export const register = async (data) => {
  const { name, email, password, role = "STUDENT", university, department, graduationYear, bio } = data;

  if (!name || !email || !password) {
    throw new ValidationException("Name, email, and password are required");
  }

  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    throw new ConflictException("Email is already registered");
  }

  let staffVerified = false;
  if (role === "RECRUITER") {
    const isOrgEmail = email.endsWith("@faculty.edu") || email.endsWith("@staff.com");
    if (!isOrgEmail) {
      throw new ValidationException(
        "Recruiter registration requires an official organization email address (e.g. ending in @faculty.edu or @staff.com)."
      );
    }
    staffVerified = true;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await userRepository.create({
    name,
    email,
    password: hashedPassword,
    role,
    staffVerified,
    university,
    department,
    graduationYear,
    bio,
    isActive: true,
  });

  const token = generateToken({
    userId: newUser._id,
    role: newUser.role,
    email: newUser.email,
    staffVerified: newUser.staffVerified,
  });

  return { user: newUser, token };
};

export const forgotPassword = async (email) => {
  if (!email) {
    throw new ValidationException("Email is required");
  }

  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new NotFoundException("No account found with this email");
  }

  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  
  // Set expiration time to 1 hour
  const tokenExpires = new Date(Date.now() + 3600000);

  await userRepository.updateById(user._id, {
    resetPasswordToken: hashedToken,
    resetPasswordExpires: tokenExpires,
  });

  // Construct reset link
  const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

  return { resetLink, resetToken };
};

export const resetPassword = async (token, newPassword) => {
  if (!token || !newPassword) {
    throw new ValidationException("Token and new password are required");
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await userRepository.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: new Date() },
  });

  if (!user) {
    throw new ValidationException("Password reset token is invalid or has expired");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await userRepository.updateById(user._id, {
    password: hashedPassword,
    resetPasswordToken: null,
    resetPasswordExpires: null,
  });

  return { success: true };
};

export default {
  login,
  createRecruiter,
  register,
  forgotPassword,
  resetPassword,
};
