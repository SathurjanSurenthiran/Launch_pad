import axiosInstance from '../api/axiosInstance';

export const authService = {
  googleLogin(idToken, role) {
    return axiosInstance.post('/auth/google', { idToken, role });
  },

  getMe() {
    return axiosInstance.get('/auth/me');
  },

  logout() {
    return axiosInstance.post('/auth/logout');
  },
};

export default authService;
