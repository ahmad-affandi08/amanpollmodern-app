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
    select: (data) => {
      // Transform data for charts
      const aduanData = data.charts.aduan.labels.map((label, idx) => ({
        name: label,
        Pending: data.charts.aduan.pending[idx],
        Selesai: data.charts.aduan.selesai[idx]
      }));

      const kategoriData = data.charts.kategori.labels.map((label, idx) => ({
        name: label,
        value: data.charts.kategori.data[idx]
      }));

      const kondisiData = data.charts.kondisi.labels.map((label, idx) => ({
        name: label,
        value: data.charts.kondisi.data[idx]
      }));

      const dayaData = data.charts.daya.labels.map((label, idx) => ({
        name: label,
        value: data.charts.daya.data[idx]
      }));

      const kalibrasiData = data.charts.kalibrasi.labels.map((label, idx) => ({
        name: label,
        value: data.charts.kalibrasi.data[idx]
      }));

      const nilaiInventarisData = data.charts.nilaiInventaris.labels.map((label, idx) => ({
        name: label,
        value: data.charts.nilaiInventaris.data[idx]
      }));

      const pemeliharaanData = data.charts.pemeliharaan.labels.map((label, idx) => ({
        name: label,
        'Belum Selesai': data.charts.pemeliharaan.belumSelesai[idx],
        'Selesai': data.charts.pemeliharaan.selesai[idx]
      }));

      return {
        stats: data.stats,
        charts: {
          aduan: aduanData,
          kategori: kategoriData,
          kondisi: kondisiData,
          daya: dayaData,
          kalibrasi: kalibrasiData,
          nilaiInventaris: nilaiInventarisData,
          pemeliharaan: pemeliharaanData
        },
        recent: data.recent_activities
      };
    }
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
