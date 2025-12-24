import axiosClient from './axiosClient';

const NotificationApi = {
  // Get unread notifications
  getUnread: () => axiosClient.get('/notifications/unread'),

  // Get all notifications (paginated)
  getAll: (params) => axiosClient.get('/notifications', { params }),

  // Get unread count
  getUnreadCount: () => axiosClient.get('/notifications/unread-count'),

  // Mark all as read
  markAllAsRead: () => axiosClient.post('/notifications/mark-all-read'),

  // Mark single as read
  markAsRead: (id) => {
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Invalid notification ID'));
    }
    return axiosClient.post(`/notifications/${id}/mark-read`);
  },

  // Delete notification
  delete: (id) => {
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Invalid notification ID'));
    }
    return axiosClient.delete(`/notifications/${id}`);
  },

  // Delete all notifications
  deleteAll: () => axiosClient.delete('/notifications')
};

export default NotificationApi;
