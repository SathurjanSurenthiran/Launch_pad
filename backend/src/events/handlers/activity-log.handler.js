import EVENTS from "../event-names.js";
import logger from "../../utils/logger.js";

/**
 * Registers all activity log handlers onto the event emitter.
 * @param {EventEmitter} emitter 
 * @param {Object} repositories 
 */
export const registerActivityLogHandlers = (emitter, { activityLogRepository }) => {
  
  // ON 'PROJECT_CREATED'
  emitter.on(EVENTS.PROJECT_CREATED, async ({ projectId, ownerId, projectTitle }) => {
    try {
      await activityLogRepository.create({
        user: ownerId,
        action: EVENTS.PROJECT_CREATED,
        entity: "Project",
        entityId: projectId,
        metadata: { projectTitle },
      });
      logger.info(`[ActivityLog] Logged PROJECT_CREATED for project ${projectId}`);
    } catch (error) {
      logger.error(`[ActivityLog Error] PROJECT_CREATED: ${error.message}`, { stack: error.stack });
    }
  });

  // ON 'PROJECT_STATUS_CHANGED'
  emitter.on(EVENTS.PROJECT_STATUS_CHANGED, async ({ projectId, ownerId, projectTitle, status, rejectionReason, actorId }) => {
    try {
      await activityLogRepository.create({
        user: actorId || ownerId,
        action: EVENTS.PROJECT_STATUS_CHANGED,
        entity: "Project",
        entityId: projectId,
        metadata: { status, projectTitle, rejectionReason },
      });
      logger.info(`[ActivityLog] Logged PROJECT_STATUS_CHANGED to ${status} for project ${projectId}`);
    } catch (error) {
      logger.error(`[ActivityLog Error] PROJECT_STATUS_CHANGED: ${error.message}`, { stack: error.stack });
    }
  });

  // ON 'PROJECT_LIKED'
  emitter.on(EVENTS.PROJECT_LIKED, async ({ projectId, projectTitle, likedByUserId, likedByName, projectOwnerId }) => {
    try {
      await activityLogRepository.create({
        user: likedByUserId,
        action: EVENTS.PROJECT_LIKED,
        entity: "Project",
        entityId: projectId,
        metadata: { projectTitle, projectOwnerId, likedByName },
      });
      logger.info(`[ActivityLog] Logged PROJECT_LIKED by ${likedByUserId} for project ${projectId}`);
    } catch (error) {
      logger.error(`[ActivityLog Error] PROJECT_LIKED: ${error.message}`, { stack: error.stack });
    }
  });

  // ON 'USER_FOLLOWED'
  emitter.on(EVENTS.USER_FOLLOWED, async ({ followerId, followerName, followingId }) => {
    try {
      await activityLogRepository.create({
        user: followerId,
        action: EVENTS.USER_FOLLOWED,
        entity: "User",
        entityId: followingId,
        metadata: { followerName },
      });
      logger.info(`[ActivityLog] Logged USER_FOLLOWED: ${followerId} followed ${followingId}`);
    } catch (error) {
      logger.error(`[ActivityLog Error] USER_FOLLOWED: ${error.message}`, { stack: error.stack });
    }
  });
};

export default registerActivityLogHandlers;
