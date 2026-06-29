import { notificationRepository } from "../container/container.js";
import NotFoundException from "../exceptions/not-found.exception.js";
import ValidationException from "../exceptions/validation.exception.js";

/**
 * Validates and sanitizes pagination values.
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
 * Retrieves paginated notifications for the requesting user, newest first.
 */
export const getMyNotifications = async (userId, page = 1, limit = 12) => {
  const { page: p, limit: l } = validatePagination(page, limit);
  return await notificationRepository.findByRecipient(userId, p, l);
};

/**
 * Marks a single notification as read if it belongs to the user.
 */
export const markAsRead = async (notificationId, userId) => {
  const notification = await notificationRepository.markAsRead(notificationId, userId);
  if (!notification) {
    throw new NotFoundException("Notification not found");
  }
  return notification;
};

/**
 * Marks all notifications for a user as read.
 */
export const markAllAsRead = async (userId) => {
  await notificationRepository.markAllAsRead(userId);
  return { success: true };
};

/**
 * Retrieves the count of unread notifications.
 */
export const getUnreadCount = async (userId) => {
  const count = await notificationRepository.countUnread(userId);
  return { count };
};

export default {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
};
