import axiosInstance from '../api/axiosInstance';

export const userService = {
  getMyProfile() {
    return axiosInstance.get('/users/me');
  },

  updateMyProfile(formData) {
    return axiosInstance.patch('/users/me', formData);
  },

  getUserById(id) {
    return axiosInstance.get(`/users/${id}`);
  },

  getUserProjects(id, params) {
    return axiosInstance.get(`/users/${id}/projects`, { params });
  },
};

export default userService;
