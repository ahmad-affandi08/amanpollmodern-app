import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import AduanApi from '../../api/AduanApi';
import { queryKeys } from '../../lib/queryKeys';

// Get all aduan with filters
export const useAduan = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.aduan.list(filters),
    queryFn: async () => {
      const res = await AduanApi.getAll(filters);
      return {
        data: res.data || [],
        meta: res.meta,
      };
    },
  });
};

// Get all aduan with filters (Infinite Scroll)
export const useAduanListInfinite = (filters = {}, limit = 10) => {
  return useInfiniteQuery({
    queryKey: ['aduan', 'infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await AduanApi.getAll({
        ...filters,
        page: pageParam,
        per_page: limit
      });
      return {
        data: res.data || [],
        meta: res.meta
      };
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.meta?.current_page < lastPage.meta?.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
  });
};

// Get assigned aduan for teknisi (Infinite Scroll)
export const useAduanAssignments = (limit = 10, statusFilter = undefined) => {
  return useInfiniteQuery({
    queryKey: ['aduan', 'assignments', statusFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const params = {
        page: pageParam,
        per_page: limit
      };

      // Map frontend filter values to backend status values
      if (statusFilter) {
        const statusMap = {
          'pending': 'Pending',
          'sedang_dikerjakan': 'Sedang Dikerjakan',
          'tindakan_lanjutan': 'Tindakan Lanjutan',
          'selesai': 'Selesai'
        };
        params.status_aduan = statusMap[statusFilter] || statusFilter;
      }

      const res = await AduanApi.getAssignments(pageParam, limit, params.status_aduan);
      return res; // Expecting { data: [], links: {}, meta: {} }
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.meta?.current_page < lastPage.meta?.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
  });
};

// Get single aduan
export const useAduanDetail = (id) => {
  return useQuery({
    queryKey: queryKeys.aduan.detail(id),
    queryFn: async () => {
      const res = await AduanApi.getById(id);
      return res; // Backend returns AduanResource directly, not wrapped in { data: ... }
    },
    enabled: !!id,
  });
};

// Create aduan mutation
export const useCreateAduan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => AduanApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.aduan.lists() });
    },
  });
};

// Update aduan mutation
export const useUpdateAduan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => AduanApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.aduan.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.aduan.detail(variables.id) });
    },
  });
};

// Update status mutation
export const useUpdateAduanStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => AduanApi.updateStatus(id, status),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.aduan.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.aduan.detail(variables.id) });
    },
  });
};

// Delete aduan mutation
export const useDeleteAduan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => AduanApi.delete(id),
    onSuccess: () => {
      // Invalidate both aduan lists and report queries
      queryClient.invalidateQueries({ queryKey: queryKeys.aduan.lists() });
      queryClient.invalidateQueries({ queryKey: ['reports', 'aduan'] });
    },
  });
};

// Update inspection (Form Pemeriksaan) mutation
export const useUpdateInspection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => AduanApi.updateInspection(id, data),
    onSuccess: (_, variables) => {
      // Invalidate all aduan-related queries
      queryClient.invalidateQueries({ queryKey: ['aduan'] });
      // Specifically invalidate the detail query for this aduan
      queryClient.invalidateQueries({ queryKey: queryKeys.aduan.detail(variables.id) });
      // Invalidate assignments (for teknisi list)
      queryClient.invalidateQueries({ queryKey: ['aduan', 'assignments'] });
    },
  });
};

// Get inventaris list by ruangan (for mobile aduan form)
export const useInventarisList = (ruanganId) => {
  return useQuery({
    queryKey: ['inventaris', ruanganId],
    queryFn: async () => {
      const response = await fetch(`/api/inventaris?ruangan_id=${ruanganId}`);
      const data = await response.json();

      // Transform data for select dropdown
      if (Array.isArray(data?.data)) {
        return data.data.map(item => ({
          value: item.id_inventaris,
          label: `${item.no_inventaris} - ${item.nama_alat?.nama_nama_alat || 'Alat'}`,
          id_inventaris: item.id_inventaris,
          id_nama_alat: item.nama_alat_id || item.nama_alat?.id_nama_alat,
          no_inventaris: item.no_inventaris,
          nama_alat: item.nama_alat?.nama_nama_alat || '',
          merk: item.merk || item.type || '',
        }));
      }
      return [];
    },
    enabled: !!ruanganId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get divisi list (for mobile aduan form)
export const useDivisiList = () => {
  return useQuery({
    queryKey: ['divisi'],
    queryFn: async () => {
      const response = await fetch('/api/divisi');
      const data = await response.json();

      // Transform data for select dropdown
      if (Array.isArray(data?.data)) {
        return data.data.map(item => ({
          value: item.id_divisi,
          label: item.nama_divisi,
        }));
      }
      return [];
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};
