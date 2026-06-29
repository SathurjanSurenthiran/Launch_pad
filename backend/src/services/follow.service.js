import {
  followerRepository,
  userRepository,
  eventEmitter,
} from "../container/container.js";
import EVENTS from "../events/event-names.js";
import ConflictException from "../exceptions/conflict.exception.js";
import NotFoundException from "../exceptions/not-found.exception.js";

/**
 * Toggles a follow relationship between follower and following users.
 * @param {string} followerId 
 * @param {string} followingId 
 * @returns {Promise<{following: boolean}>} The toggled following status
 * @throws {ConflictException} if follower attempts to follow themselves
 * @throws {NotFoundException} if target user does not exist or is inactive
 */
export const toggleFollow = async (followerId, followingId) => {
  // 1. Prevent self-follow
  if (followerId.toString() === followingId.toString()) {
    throw new ConflictException("You cannot follow yourself");
  }

  // 2. Verify target user exists and is active
  const targetUser = await userRepository.findById(followingId);
  if (!targetUser || !targetUser.isActive) {
    throw new NotFoundException("Active user not found");
  }

  // 3. Check if relationship exists
  const existingFollow = await followerRepository.findRelationship(followerId, followingId);

  if (existingFollow) {
    // 4. If relationship exists: delete it -> return { following: false }
    await followerRepository.deleteRelationship(followerId, followingId);
    return { following: false };
  } else {
    // 5. If not: create it -> emit USER_FOLLOWED event -> return { following: true }
    await followerRepository.create({ follower: followerId, following: followingId });

    // Fetch follower details
    const follower = await userRepository.findById(followerId);
    const followerName = follower ? follower.name : "Someone";

    eventEmitter.emit(EVENTS.USER_FOLLOWED, {
      followerId,
      followerName,
      followingId,
    });

    return { following: true };
  }
};

/**
 * Checks if a user is following another user.
 * @param {string} followerId 
 * @param {string} followingId 
 * @returns {Promise<boolean>}
 */
export const isFollowing = async (followerId, followingId) => {
  if (!followerId || !followingId) return false;
  const follow = await followerRepository.findRelationship(followerId, followingId);
  return !!follow;
};

/**
 * Gets paginated list of followers for a user.
 * @param {string} userId 
 * @param {number} page 
 * @param {number} limit 
 * @returns {Promise<Object>} Paginated followers
 */
export const getFollowers = async (userId, page = 1, limit = 12) => {
  const user = await userRepository.findById(userId);
  if (!user || !user.isActive) {
    throw new NotFoundException("User not found");
  }
  return await followerRepository.getFollowers(userId, page, limit);
};

/**
 * Gets paginated list of users that a user is following.
 * @param {string} userId 
 * @param {number} page 
 * @param {number} limit 
 * @returns {Promise<Object>} Paginated following
 */
export const getFollowing = async (userId, page = 1, limit = 12) => {
  const user = await userRepository.findById(userId);
  if (!user || !user.isActive) {
    throw new NotFoundException("User not found");
  }
  return await followerRepository.getFollowing(userId, page, limit);
};

/**
 * Gets total follower and following stats count for a user.
 * @param {string} userId 
 * @returns {Promise<{followersCount: number, followingCount: number}>}
 */
export const getFollowStats = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user || !user.isActive) {
    throw new NotFoundException("User not found");
  }
  const [followersCount, followingCount] = await Promise.all([
    followerRepository.countFollowers(userId),
    followerRepository.countFollowing(userId),
  ]);
  return { followersCount, followingCount };
};

export default {
  toggleFollow,
  isFollowing,
  getFollowers,
  getFollowing,
  getFollowStats,
};
