import axiosInstance from '../api/axiosInstance';

export const projectService = {
  getProjects(params) {
    return axiosInstance.get('/projects', { params });
  },

  searchProjects(params) {
    return axiosInstance.get('/projects/search', { params });
  },

  getProjectById(id) {
    return axiosInstance.get(`/projects/${id}`);
  },

  createProject(formData) {
    return axiosInstance.post('/projects', formData);
  },

  updateProject(id, formData) {
    return axiosInstance.put(`/projects/${id}`, formData);
  },

  deleteProject(id) {
    return axiosInstance.delete(`/projects/${id}`);
  },

  hideProject(id) {
    return axiosInstance.patch(`/projects/${id}/hide`);
  },

  resubmitProject(id) {
    return axiosInstance.patch(`/projects/${id}/resubmit`);
  },
};

export default projectService;
