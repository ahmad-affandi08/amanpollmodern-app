import { useQuery } from '@tanstack/react-query';
import AduanApi from '../../api/AduanApi';
import PemeliharaanApi from '../../api/PemeliharaanApi';
import { queryKeys } from '../../lib/queryKeys';

/**
 * Hook to fetch aduan report data
 * @param {Object} filters - Filter parameters
 * @returns {Object} Query result with report data
 */
export const useReportAduan = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.reports.aduan(filters),
    queryFn: () => AduanApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to fetch pemeliharaan report data
 * @param {Object} filters - Filter parameters
 * @returns {Object} Query result with report data
 */
export const useReportPemeliharaan = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.reports.pemeliharaan(filters),
    queryFn: () => PemeliharaanApi.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
