import BaseRepository from "./base.repository.js";
import Notification from "../models/notification.model.js";

class NotificationRepository extends BaseRepository {
  constructor() {
    super(Notification);
  }

  /**
   * Finds notifications for a recipient with pagination, sorted newest first.
   * @param {string} userId - Recipient user ID
   * @param {number} page
   * @param {number} limit
   * @returns {Promise<{notifications: Array, total: number, page: number, totalPages: number}>}
   */
  async findByRecipient(userId, page = 1, limit = 12) {
    const skip = (page - 1) * limit;
    const [notifications, total] = await Promise.all([
      this.model
        .find({ recipient: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("sender", "name profilePicture role staffVerified")
        .lean(),
      this.model.countDocuments({ recipient: userId }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { notifications, total, page, totalPages };
  }

  /**
   * Marks a specific notification as read, verifying that the recipient matches userId.
   * @param {string} notificationId 
   * @param {string} userId 
   * @returns {Promise<Object>} The updated notification
   */
  async markAsRead(notificationId, userId) {
    return await this.model.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { isRead: true },
      { new: true }
    );
  }

  /**
   * Marks all unread notifications for a user as read.
   * @param {string} userId 
   * @returns {Promise<Object>} Update statistics
   */
  async markAllAsRead(userId) {
    return await this.model.updateMany(
      { recipient: userId, isRead: false },
      { isRead: true }
    );
  }

  /**
   * Counts the number of unread notifications for a user.
   * @param {string} userId 
   * @returns {Promise<number>} Unread count
   */
  async countUnread(userId) {
    return await this.model.countDocuments({ recipient: userId, isRead: false });
  }
}

export default NotificationRepository;