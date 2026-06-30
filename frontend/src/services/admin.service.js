import axiosInstance from '../api/axiosInstance';

export const adminService = {
  getDashboard() {
    return axiosInstance.get('/admin/dashboard');
  },

  getUsers(params) {
    return axiosInstance.get('/admin/users', { params });
  },

  getUserById(id) {
    return axiosInstance.get(`/admin/users/${id}`);
  },

  updateUserRole(id, role) {
    return axiosInstance.patch(`/admin/users/${id}/role`, { role });
  },

  deactivateUser(id) {
    return axiosInstance.patch(`/admin/users/${id}/deactivate`);
  },

  reactivateUser(id) {
    return axiosInstance.patch(`/admin/users/${id}/reactivate`);
  },

  getProjects(params) {
    return axiosInstance.get('/admin/projects', { params });
  },

  updateProjectStatus(id, body) {
    return axiosInstance.patch(`/admin/projects/${id}/status`, body);
  },

  deleteProject(id) {
    return axiosInstance.delete(`/admin/projects/${id}`);
  },
};

export default adminService;
