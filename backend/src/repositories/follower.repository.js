import BaseRepository from "./base.repository.js";
import Follower from "../models/follower.model.js";

class FollowerRepository extends BaseRepository {
  constructor() {
    super(Follower);
  }

  /**
   * Finds a follow relationship between follower and following.
   * @param {string} followerId 
   * @param {string} followingId 
   * @returns {Promise<Object|null>}
   */
  async findRelationship(followerId, followingId) {
    return await this.model.findOne({ follower: followerId, following: followingId });
  }

  /**
   * Retrieves followers for a user with pagination, populating follower details.
   * @param {string} userId - The user being followed
   * @param {number} page 
   * @param {number} limit 
   * @returns {Promise<{followers: Array, total: number, page: number, totalPages: number}>}
   */
  async getFollowers(userId, page = 1, limit = 12) {
    const skip = (page - 1) * limit;
    const [followers, total] = await Promise.all([
      this.model
        .find({ following: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("follower", "name profilePicture role staffVerified")
        .lean(),
      this.model.countDocuments({ following: userId }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { followers, total, page, totalPages };
  }

  /**
   * Retrieves following users for a user with pagination, populating following details.
   * @param {string} userId - The follower user
   * @param {number} page 
   * @param {number} limit 
   * @returns {Promise<{following: Array, total: number, page: number, totalPages: number}>}
   */
  async getFollowing(userId, page = 1, limit = 12) {
    const skip = (page - 1) * limit;
    const [following, total] = await Promise.all([
      this.model
        .find({ follower: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("following", "name profilePicture role staffVerified")
        .lean(),
      this.model.countDocuments({ follower: userId }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { following, total, page, totalPages };
  }

  /**
   * Counts total followers for a user.
   * @param {string} userId 
   * @returns {Promise<number>}
   */
  async countFollowers(userId) {
    return await this.model.countDocuments({ following: userId });
  }

  /**
   * Counts total following users for a user.
   * @param {string} userId 
   * @returns {Promise<number>}
   */
  async countFollowing(userId) {
    return await this.model.countDocuments({ follower: userId });
  }

  /**
   * Deletes a follow relationship.
   * @param {string} followerId 
   * @param {string} followingId 
   * @returns {Promise<Object>} Deletion result
   */
  async deleteRelationship(followerId, followingId) {
    return await this.model.findOneAndDelete({ follower: followerId, following: followingId });
  }
}

export default FollowerRepository;