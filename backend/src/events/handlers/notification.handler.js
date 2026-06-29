import EVENTS from "../event-names.js";
import logger from "../../utils/logger.js";

/**
 * Registers all notification handlers onto the event emitter.
 * @param {EventEmitter} emitter 
 * @param {Object} repositories 
 */
export const registerNotificationHandlers = (emitter, { notificationRepository }) => {
  
  // ON 'PROJECT_CREATED'
  emitter.on(EVENTS.PROJECT_CREATED, async ({ projectId, ownerId, projectTitle }) => {
    try {
      await notificationRepository.create({
        recipient: ownerId,
        type: "PROJECT_CREATED",
        message: `Your project '${projectTitle}' has been submitted for review.`,
        referenceId: projectId,
        isRead: false,
      });
      logger.info(`[Notification] Created PROJECT_CREATED for owner ${ownerId}`);
    } catch (error) {
      logger.error(`[Notification Error] PROJECT_CREATED: ${error.message}`, { stack: error.stack });
    }
  });

  // ON 'PROJECT_STATUS_CHANGED'
  emitter.on(EVENTS.PROJECT_STATUS_CHANGED, async ({ projectId, ownerId, projectTitle, status, rejectionReason }) => {
    try {
      let message = "";
      let type = "";

      if (status === "APPROVED") {
        message = `Your project '${projectTitle}' has been approved and is now live!`;
        type = "PROJECT_APPROVED";
      } else if (status === "REJECTED") {
        message = `Your project '${projectTitle}' was rejected. Reason: ${rejectionReason}`;
        type = "PROJECT_REJECTED";
      } else if (status === "HIDDEN") {
        message = `Your project '${projectTitle}' has been hidden.`;
        type = "PROJECT_HIDDEN";
      } else if (status === "PENDING") {
        message = `Your project '${projectTitle}' has been submitted for review.`;
        type = "PROJECT_UPDATED";
      } else {
        // Return without sending notification if status is DRAFT
        return;
      }

      await notificationRepository.create({
        recipient: ownerId,
        type,
        message,
        referenceId: projectId,
        isRead: false,
      });
      logger.info(`[Notification] Created ${type} for owner ${ownerId}`);
    } catch (error) {
      logger.error(`[Notification Error] PROJECT_STATUS_CHANGED: ${error.message}`, { stack: error.stack });
    }
  });

  // ON 'PROJECT_LIKED'
  emitter.on(EVENTS.PROJECT_LIKED, async ({ projectId, projectTitle, likedByUserId, likedByName, projectOwnerId }) => {
    try {
      // Don't notify on self-likes
      if (likedByUserId.toString() === projectOwnerId.toString()) {
        return;
      }

      await notificationRepository.create({
        recipient: projectOwnerId,
        sender: likedByUserId,
        type: "PROJECT_LIKED",
        message: `${likedByName} liked your project '${projectTitle}'.`,
        referenceId: projectId,
        isRead: false,
      });
      logger.info(`[Notification] Created PROJECT_LIKED for owner ${projectOwnerId}`);
    } catch (error) {
      logger.error(`[Notification Error] PROJECT_LIKED: ${error.message}`, { stack: error.stack });
    }
  });

  // ON 'USER_FOLLOWED'
  emitter.on(EVENTS.USER_FOLLOWED, async ({ followerId, followerName, followingId }) => {
    try {
      await notificationRepository.create({
        recipient: followingId,
        sender: followerId,
        type: "USER_FOLLOWED",
        message: `${followerName} started following you.`,
        referenceId: followerId,
        isRead: false,
      });
      logger.info(`[Notification] Created USER_FOLLOWED for followed user ${followingId}`);
    } catch (error) {
      logger.error(`[Notification Error] USER_FOLLOWED: ${error.message}`, { stack: error.stack });
    }
  });
};

export default registerNotificationHandlers;
