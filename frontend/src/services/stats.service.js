import axiosInstance from '../api/axiosInstance';

export const statsService = {
  getPublicStats() {
    return axiosInstance.get('/stats');
  },
};

export default statsService;
