import UserRepository from "../repositories/user.repository.js";
import ProjectRepository from "../repositories/project.repository.js";
import LikeRepository from "../repositories/like.repository.js";
import FollowerRepository from "../repositories/follower.repository.js";
import NotificationRepository from "../repositories/notification.repository.js";
import ActivityLogRepository from "../repositories/activity-log.repository.js";

import eventEmitter from "../events/event-emitter.js";
import { registerNotificationHandlers } from "../events/handlers/notification.handler.js";
import { registerActivityLogHandlers } from "../events/handlers/activity-log.handler.js";

const userRepository = new UserRepository();
const projectRepository = new ProjectRepository();
const likeRepository = new LikeRepository();
const followerRepository = new FollowerRepository();
const notificationRepository = new NotificationRepository();
const activityLogRepository = new ActivityLogRepository();

// Register event listeners
registerNotificationHandlers(eventEmitter, {
  notificationRepository,
  userRepository,
  projectRepository,
});

registerActivityLogHandlers(eventEmitter, {
  activityLogRepository,
});

export {
  userRepository,
  projectRepository,
  likeRepository,
  followerRepository,
  notificationRepository,
  activityLogRepository,
  eventEmitter,
};
