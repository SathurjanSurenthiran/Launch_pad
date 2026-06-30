import axiosInstance from '../api/axiosInstance';

export const notificationService = {
  getNotifications(params) {
    return axiosInstance.get('/notifications', { params });
  },

  getUnreadCount() {
    return axiosInstance.get('/notifications/unread-count');
  },

  markAllRead() {
    return axiosInstance.patch('/notifications/read-all');
  },

  markOneRead(id) {
    return axiosInstance.patch(`/notifications/${id}/read`);
  },
};

export default notificationService;
