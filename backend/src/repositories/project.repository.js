import BaseRepository from "./base.repository.js";
import Project from "../models/project.model.js";

class ProjectRepository extends BaseRepository {
  constructor() {
    super(Project);
  }

  /**
   * Finds projects matching a filter with pagination and sorting.
   * @param {Object} filter - MongoDB query filter
   * @param {number} page - Current page number
   * @param {number} limit - Number of items per page
   * @param {Object} sort - Sorting options
   * @returns {Promise<{projects: Array, total: number, page: number, totalPages: number}>}
   */
  async findWithPagination(filter = {}, page = 1, limit = 12, sort = { createdAt: -1 }) {
    const skip = (page - 1) * limit;
    const [projects, total] = await Promise.all([
      this.model
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("owner", "name email profilePicture role staffVerified")
        .lean(),
      this.model.countDocuments(filter),
    ]);
    const totalPages = Math.ceil(total / limit);
    return { projects, total, page, totalPages };
  }

  /**
   * Searches projects using $text search plus additional filters and pagination.
   * @param {string} textQuery - Text to search in title and description
   * @param {Object} filters - Additional criteria (e.g. category, techStack)
   * @param {number} page 
   * @param {number} limit 
   * @returns {Promise<{projects: Array, total: number, page: number, totalPages: number}>}
   */
  async searchProjects(textQuery, filters = {}, page = 1, limit = 12) {
    const filter = { ...filters };
    if (textQuery) {
      filter.$text = { $search: textQuery };
    }

    const sort = textQuery
      ? { score: { $meta: "textScore" } }
      : { createdAt: -1 };

    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      this.model
        .find(filter, textQuery ? { score: { $meta: "textScore" } } : {})
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate("owner", "name email profilePicture role staffVerified")
        .lean(),
      this.model.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(total / limit);
    return { projects, total, page, totalPages };
  }

  /**
   * Finds projects belonging to a specific owner with pagination.
   * @param {string} userId - Owner ID
   * @param {number} page 
   * @param {number} limit 
   * @returns {Promise<{projects: Array, total: number, page: number, totalPages: number}>}
   */
  async findByOwner(userId, page = 1, limit = 12) {
    return this.findWithPagination({ owner: userId }, page, limit);
  }

  async findApprovedProjects() {
    return await this.model
      .find({ status: "APPROVED" })
      .populate("owner", "name email profilePicture role staffVerified")
      .lean();
  }

  async incrementLike(projectId) {
    return await this.model.findByIdAndUpdate(
      projectId,
      { $inc: { likeCount: 1 } },
      { new: true }
    );
  }

  async decrementLike(projectId) {
    return await this.model.findByIdAndUpdate(
      projectId,
      { $inc: { likeCount: -1 } },
      { new: true }
    );
  }

  async incrementViews(projectId) {
    return await this.model.findByIdAndUpdate(
      projectId,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
  }
}

export default ProjectRepository;