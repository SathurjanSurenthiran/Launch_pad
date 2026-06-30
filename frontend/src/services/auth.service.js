import axiosInstance from '../api/axiosInstance';

const SESSION_MARKER_KEY = 'launchpad_has_session';

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

  hasSessionMarker() {
    return localStorage.getItem(SESSION_MARKER_KEY) === 'true';
  },

  markSession() {
    localStorage.setItem(SESSION_MARKER_KEY, 'true');
  },

  clearSession() {
    localStorage.removeItem(SESSION_MARKER_KEY);
  },
};

export default authService;
