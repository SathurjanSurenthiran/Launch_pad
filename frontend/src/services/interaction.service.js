import axiosInstance from '../api/axiosInstance';

export const interactionService = {
  toggleLike(projectId) {
    return axiosInstance.post(`/interactions/projects/${projectId}/like`);
  },

  getProjectLikes(projectId) {
    return axiosInstance.get(`/interactions/projects/${projectId}/likes`);
  },

  toggleFollow(userId) {
    return axiosInstance.post(`/interactions/users/${userId}/follow`);
  },

  getFollowers(userId) {
    return axiosInstance.get(`/interactions/users/${userId}/followers`);
  },

  getFollowing(userId) {
    return axiosInstance.get(`/interactions/users/${userId}/following`);
  },
};

export default interactionService;
