import {
  userRepository,
  projectRepository,
  likeRepository,
  activityLogRepository,
} from "../container/container.js";
import followService from "./follow.service.js";
import NotFoundException from "../exceptions/not-found.exception.js";
import ValidationException from "../exceptions/validation.exception.js";

/**
 * Validates and sanitizes pagination values.
 * Default limit for admin panels is 20.
 */
const validatePagination = (page, limit) => {
  const p = Number(page);
  const l = Number(limit);

  if (isNaN(p) || isNaN(l) || p <= 0 || l <= 0 || !Number.isInteger(p) || !Number.isInteger(l)) {
    throw new ValidationException("Page and limit must be positive integers");
  }
  if (l > 50) {
    throw new ValidationException("Limit cannot exceed 50");
  }
  return { page: p, limit: l };
};

/**
 * Retrieves all users with filters and pagination (ADMIN only).
 */
export const getAllUsers = async (filters, page = 1, limit = 20) => {
  const { page: p, limit: l } = validatePagination(page, limit);
  const query = {};

  if (filters.role) {
    query.role = filters.role;
  }
  if (filters.isActive !== undefined) {
    query.isActive = filters.isActive === "true" || filters.isActive === true;
  }
  if (filters.search) {
    query.$or = [
      { name: { $regex: filters.search, $options: "i" } },
      { email: { $regex: filters.search, $options: "i" } },
    ];
  }

  const skip = (p - 1) * l;
  const [users, total] = await Promise.all([
    userRepository.model.find(query).skip(skip).limit(l),
    userRepository.model.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / l);
  return { users, total, page: p, totalPages };
};

/**
 * Retrieves full user details + stats (ADMIN only).
 */
export const getUserById = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  const followStats = await followService.getFollowStats(userId);
  const projectCount = await projectRepository.count({ owner: userId });

  return { user, followStats, projectCount };
};

/**
 * Updates user role (ADMIN only). Escalation to ADMIN role is blocked.
 * Admins cannot update their own roles.
 */
export const updateUserRole = async (adminId, targetUserId, newRole) => {
  if (adminId.toString() === targetUserId.toString()) {
    throw new ValidationException("Admins cannot change their own roles");
  }

  const allowedRoles = ["STUDENT", "RECRUITER"];
  if (!allowedRoles.includes(newRole)) {
    throw new ValidationException("Cannot assign ADMIN role or invalid role requested");
  }

  const user = await userRepository.findById(targetUserId);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  const updateData = { role: newRole };
  if (newRole === "RECRUITER") {
    updateData.staffVerified = true;
  } else {
    updateData.staffVerified = false;
  }

  const updatedUser = await userRepository.updateById(targetUserId, updateData);

  // Log activity
  await activityLogRepository.create({
    user: adminId,
    action: "ADMIN_UPDATE_ROLE",
    entity: "User",
    entityId: targetUserId,
    metadata: { oldRole: user.role, newRole },
  });

  return updatedUser;
};

/**
 * Deactivates user and hides all of their active projects.
 */
export const deactivateUser = async (adminId, userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  const updatedUser = await userRepository.updateById(userId, { isActive: false });

  // Hide all of their projects
  await projectRepository.model.updateMany(
    { owner: userId },
    { status: "HIDDEN" }
  );

  // Log activity
  await activityLogRepository.create({
    user: adminId,
    action: "ADMIN_DEACTIVATE_USER",
    entity: "User",
    entityId: userId,
    metadata: {},
  });

  return updatedUser;
};

/**
 * Reactivates a deactivated user.
 */
export const reactivateUser = async (adminId, userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new NotFoundException("User not found");
  }

  const updatedUser = await userRepository.updateById(userId, { isActive: true });

  // Log activity
  await activityLogRepository.create({
    user: adminId,
    action: "ADMIN_REACTIVATE_USER",
    entity: "User",
    entityId: userId,
    metadata: {},
  });

  return updatedUser;
};

/**
 * Retrieves all projects of any status with filters and pagination (ADMIN only).
 */
export const getAllProjects = async (filters, page = 1, limit = 20) => {
  const { page: p, limit: l } = validatePagination(page, limit);
  const query = {};

  if (filters.status) query.status = filters.status;
  if (filters.category) query.category = filters.category;
  if (filters.owner) query.owner = filters.owner;

  return await projectRepository.findWithPagination(query, p, l);
};

/**
 * Gathers system-wide dashboard statistics.
 */
export const getDashboardStats = async () => {
  const [totalUsers, totalProjects, pendingProjects, totalLikes, activeRecruiters] = await Promise.all([
    userRepository.count(),
    projectRepository.count(),
    projectRepository.count({ status: "PENDING" }),
    likeRepository.count(),
    userRepository.count({ role: "RECRUITER", isActive: true }),
  ]);

  return {
    totalUsers,
    totalProjects,
    pendingProjects,
    totalLikes,
    activeRecruiters,
  };
};

export default {
  getAllUsers,
  getUserById,
  updateUserRole,
  deactivateUser,
  reactivateUser,
  getAllProjects,
  getDashboardStats,
};
