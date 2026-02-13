import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import NotificationApi from '../../api/NotificationApi';
import { queryKeys } from '../../lib/queryKeys';


export const useUnreadNotifications = () => {
  return useQuery({
    queryKey: queryKeys.notifications.unread(),
    queryFn: async () => {
      const res = await NotificationApi.getUnread();

      return Array.isArray(res.data?.data) ? res.data.data : [];
    },
  });
};


export const useUnreadCount = () => {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: async () => {
      const res = await NotificationApi.getUnreadCount();
      return res.data.count || 0;
    },
    refetchInterval: 30000,
  });
};


export const useNotifications = (page = 1, perPage = 20) => {
  return useQuery({
    queryKey: queryKeys.notifications.list(page),
    queryFn: async () => {
      const res = await NotificationApi.getAll({ page, per_page: perPage });

      return {
        data: Array.isArray(res.data?.data) ? res.data.data : [],
        meta: res.data?.meta,
      };
    },
  });
};


export const useMarkAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => NotificationApi.markAsRead(id),
    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};


export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};


export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => NotificationApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};


export const useDeleteAllNotifications = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => NotificationApi.deleteAll(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};
