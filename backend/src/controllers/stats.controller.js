import statsService from "../services/stats.service.js";
import ApiResponse from "../utils/api-response.js";

/**
 * Returns public platform statistics (no auth required).
 */
export const getPublicStats = async (req, res, next) => {
  try {
    const stats = await statsService.getPublicStats();
    return ApiResponse.success(res, stats, "Platform statistics retrieved successfully");
  } catch (error) {
    next(error);
  }
};

export default { getPublicStats };
