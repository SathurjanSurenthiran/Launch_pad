import axios from 'axios';
import { BASE_URL } from '../utils/constants';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthMe = error.config && error.config.url && error.config.url.endsWith('/auth/me');
      if (window.location.pathname !== '/login' && !isAuthMe) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
