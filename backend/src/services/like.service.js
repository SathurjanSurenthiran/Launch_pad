import {
  likeRepository,
  projectRepository,
  userRepository,
  eventEmitter,
} from "../container/container.js";
import EVENTS from "../events/event-names.js";
import ConflictException from "../exceptions/conflict.exception.js";
import NotFoundException from "../exceptions/not-found.exception.js";

/**
 * Toggles the like state of a project for a user.
 * @param {string} userId - The liker user ID
 * @param {string} projectId - The target project ID
 * @returns {Promise<{liked: boolean}>} The toggled like status
 * @throws {NotFoundException} if project does not exist or is not approved
 * @throws {ConflictException} if user attempts to like their own project
 */
export const toggleLike = async (userId, projectId) => {
  // 1. Verify project exists and is APPROVED
  const project = await projectRepository.findById(projectId);
  if (!project || project.status !== "APPROVED") {
    throw new NotFoundException("Approved project not found");
  }

  // 2. Prevent self-like
  if (project.owner.toString() === userId.toString()) {
    throw new ConflictException("You cannot like your own project");
  }

  // 3. Check if like already exists
  const existingLike = await likeRepository.findByUserAndProject(userId, projectId);

  if (existingLike) {
    // 4. If exists: delete like, decrement project.likeCount
    await likeRepository.deleteByUserAndProject(userId, projectId);
    await projectRepository.decrementLike(projectId);
    return { liked: false };
  } else {
    // 5. If not: create like, increment project.likeCount -> emit event
    await likeRepository.create({ user: userId, project: projectId });
    await projectRepository.incrementLike(projectId);

    // Fetch user info for name
    const liker = await userRepository.findById(userId);
    const likerName = liker ? liker.name : "Someone";

    eventEmitter.emit(EVENTS.PROJECT_LIKED, {
      projectId: project._id,
      projectTitle: project.title,
      likedByUserId: userId,
      likedByName: likerName,
      projectOwnerId: project.owner,
    });

    return { liked: true };
  }
};

/**
 * Checks if a user liked a project.
 * @param {string} userId 
 * @param {string} projectId 
 * @returns {Promise<boolean>}
 */
export const isLiked = async (userId, projectId) => {
  if (!userId || !projectId) return false;
  const like = await likeRepository.findByUserAndProject(userId, projectId);
  return !!like;
};

/**
 * Gets paginated likes list for a project.
 * @param {string} projectId 
 * @param {number} page 
 * @param {number} limit 
 * @returns {Promise<Object>} Paginated likes
 */
export const getProjectLikes = async (projectId, page = 1, limit = 12) => {
  const project = await projectRepository.findById(projectId);
  if (!project || project.status !== "APPROVED") {
    throw new NotFoundException("Approved project not found");
  }
  return await likeRepository.getLikesByProject(projectId, page, limit);
};

export default {
  toggleLike,
  isLiked,
  getProjectLikes,
};
