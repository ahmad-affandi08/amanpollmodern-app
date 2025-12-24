import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosClient from '../api/axiosClient';

// Get System Status
export const useSystemStatus = () => {
  return useQuery({
    queryKey: ['system-status'],
    queryFn: async () => {
      const { data } = await axiosClient.get('/system/status');
      return data;
    },
    // Fetch more frequently to be sure
    refetchInterval: 30000,
  });
};

// Toggle Maintenace Mode
export const useToggleMaintenance = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ enable, secret }) => {
      const { data } = await axiosClient.post('/system/maintenance', { enable, secret });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['system-status']);
    },
  });
};
