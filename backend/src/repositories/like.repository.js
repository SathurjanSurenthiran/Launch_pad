import BaseRepository from "./base.repository.js";
import Like from "../models/like.model.js";

class LikeRepository extends BaseRepository {
  constructor() {
    super(Like);
  }

  /**
   * Finds a single like by user and project.
   * @param {string} userId 
   * @param {string} projectId 
   * @returns {Promise<Object|null>} The like document or null
   */
  async findByUserAndProject(userId, projectId) {
    return await this.model.findOne({ user: userId, project: projectId });
  }

  /**
   * Retrieves a paginated list of likes for a project, populating user details.
   * @param {string} projectId 
   * @param {number} page 
   * @param {number} limit 
   * @returns {Promise<{likes: Array, total: number, page: number, totalPages: number}>}
   */
  async getLikesByProject(projectId, page = 1, limit = 12) {
    const skip = (page - 1) * limit;
    const [likes, total] = await Promise.all([
      this.model
        .find({ project: projectId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name profilePicture role staffVerified")
        .lean(),
      this.model.countDocuments({ project: projectId }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { likes, total, page, totalPages };
  }

  /**
   * Deletes a like by user and project.
   * @param {string} userId 
   * @param {string} projectId 
   * @returns {Promise<Object>} Deletion result
   */
  async deleteByUserAndProject(userId, projectId) {
    return await this.model.findOneAndDelete({ user: userId, project: projectId });
  }
}

export default LikeRepository;