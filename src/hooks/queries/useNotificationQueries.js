import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import NotificationApi from '../../api/NotificationApi';
import { queryKeys } from '../../lib/queryKeys';

// Get unread notifications
export const useUnreadNotifications = () => {
  return useQuery({
    queryKey: queryKeys.notifications.unread(),
    queryFn: async () => {
      const res = await NotificationApi.getUnread();
      // API returns: res.data = { data: [...] }
      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
  });
};

// Get unread count
export const useUnreadCount = () => {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const res = await NotificationApi.getUnreadCount();
      return res.data.count || 0;
    },
    refetchInterval: 30000, // Auto-refetch every 30 seconds
  });
};

// Get all notifications (paginated)
export const useNotifications = (page = 1, perPage = 20) => {
  return useQuery({
    queryKey: queryKeys.notifications.list(page),
    queryFn: async () => {
      const res = await NotificationApi.getAll({ page, per_page: perPage });
      // API returns: res.data = { data: [...], meta: {...} }
      return {
        data: Array.isArray(res.data?.data) ? res.data.data : [],
        meta: res.data?.meta,
      };
    },
  });
};

// Mark as read mutation
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => NotificationApi.markAsRead(id),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

// Mark all as read mutation
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

// Delete notification mutation
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => NotificationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

// Delete all notifications mutation
export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationApi.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};
