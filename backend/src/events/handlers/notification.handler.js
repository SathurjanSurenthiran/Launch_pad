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
        message: `Submission Received: Your project "${projectTitle}" has been submitted and is pending review by an administrator.`,
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
        message = `Project Approved: Your project "${projectTitle}" has been reviewed and approved. It is now publicly visible.`;
        type = "PROJECT_APPROVED";
      } else if (status === "REJECTED") {
        message = `Project Rejected: Your project "${projectTitle}" was not approved. Reason: ${rejectionReason}. Please review the feedback and resubmit if applicable.`;
        type = "PROJECT_REJECTED";
      } else if (status === "HIDDEN") {
        message = `Project Hidden: Your project "${projectTitle}" has been hidden from public view by an administrator.`;
        type = "PROJECT_HIDDEN";
      } else if (status === "PENDING") {
        message = `Submission Updated: Your project "${projectTitle}" has been resubmitted and is pending review.`;
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
        message: `Project Engagement: ${likedByName} has endorsed your project "${projectTitle}". Your work is gaining recognition on the platform.`,
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
        message: `New Follower: ${followerName} is now following your profile.`,
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
