import axiosClient from './axiosClient';

const NotificationApi = {

  getUnread: () => axiosClient.get('/notifications/unread'),


  getAll: (params) => axiosClient.get('/notifications', { params }),


  getUnreadCount: () => axiosClient.get('/notifications/unread-count'),


  markAllAsRead: () => axiosClient.post('/notifications/mark-all-read'),


  markAsRead: (id) => {
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Invalid notification ID'));
    }
    return axiosClient.post(`/notifications/${id}/mark-read`);
  },


  delete: (id) => {
    if (!id || id === 'undefined') {
      return Promise.reject(new Error('Invalid notification ID'));
    }
    return axiosClient.delete(`/notifications/${id}`);
  },


  deleteAll: () => axiosClient.delete('/notifications')
};

export default NotificationApi;
