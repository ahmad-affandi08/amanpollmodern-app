import { useQuery } from '@tanstack/react-query';
import DashboardApi from '../../api/DashboardApi';
import axiosClient from '../../api/axiosClient';
import { queryKeys } from '../../lib/queryKeys';

/**
 * Hook to fetch dashboard statistics
 * @param {Object} filters - Filter parameters (tahun_filter, divisi_id, ruangan_filter)
 * @returns {Object} Query result with stats, charts, and recent activities
 */
export const useDashboardStats = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(filters),
    queryFn: () => DashboardApi.getStats(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes (dashboard data changes frequently)
    // Backend now returns data in correct format, no transformation needed
  });
};

/**
 * Hook to fetch mobile dashboard data for User Ruangan and Teknisi
 * @param {Object} filters - Filter parameters (tahun_filter, bulan_filter, kategori_filter)
 * @returns {Object} Query result with user info, stats, and charts
 */
export const useMobileDashboard = (filters = {}) => {
  return useQuery({
    queryKey: ['mobile-dashboard', filters],
    queryFn: async () => {
      const response = await axiosClient.get('/mobile/dashboard', {
        params: filters
      });
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
