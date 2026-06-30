import {
  userRepository,
  projectRepository,
} from "../container/container.js";

/**
 * Returns public-facing platform statistics.
 * No authentication required.
 */
export const getPublicStats = async () => {
  const [totalStudents, totalRecruiters, totalProjects] = await Promise.all([
    userRepository.count({ role: "STUDENT", isActive: true }),
    userRepository.count({ role: "RECRUITER", isActive: true }),
    projectRepository.count({ status: "APPROVED" }),
  ]);

  return {
    totalStudents,
    totalRecruiters,
    totalProjects,
  };
};

export default { getPublicStats };
