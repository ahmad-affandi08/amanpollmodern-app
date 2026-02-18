import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import AduanApi from '../../api/AduanApi';
import { queryKeys } from '../../lib/queryKeys';


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


export const useAduanAssignments = (limit = 10, statusFilter = undefined) => {
  return useInfiniteQuery({
    queryKey: ['aduan', 'assignments', statusFilter],
    queryFn: async ({ pageParam = 1 }) => {
      const params = {
        page: pageParam,
        per_page: limit
      };


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
      return res;
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.meta?.current_page < lastPage.meta?.last_page) {
        return lastPage.meta.current_page + 1;
      }
      return undefined;
    },
  });
};


export const useAduanDetail = (id) => {
  return useQuery({
    queryKey: queryKeys.aduan.detail(id),
    queryFn: async () => {
      const res = await AduanApi.getById(id);
      return res;
    },
    enabled: !!id,
  });
};


export const useCreateAduan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => AduanApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.aduan.lists() });
    },
  });
};


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


export const useDeleteAduan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => AduanApi.delete(id),
    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: queryKeys.aduan.lists() });
      queryClient.invalidateQueries({ queryKey: ['reports', 'aduan'] });
    },
  });
};


export const useUpdateInspection = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => AduanApi.updateInspection(id, data),
    onSuccess: (_, variables) => {

      queryClient.invalidateQueries({ queryKey: ['aduan'] });

      queryClient.invalidateQueries({ queryKey: queryKeys.aduan.detail(variables.id) });

      queryClient.invalidateQueries({ queryKey: ['aduan', 'assignments'] });
    },
  });
};


export const useInventarisList = (ruanganId) => {
  return useQuery({
    queryKey: ['inventaris', ruanganId],
    queryFn: async () => {
      const response = await fetch(`/api/inventaris?ruangan_id=${ruanganId}`);
      const data = await response.json();


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
    staleTime: 5 * 60 * 1000,
  });
};


export const useDivisiList = () => {
  return useQuery({
    queryKey: ['divisi'],
    queryFn: async () => {
      const response = await fetch('/api/divisi');
      const data = await response.json();


      if (Array.isArray(data?.data)) {
        return data.data.map(item => ({
          value: item.id_divisi,
          label: item.nama_divisi,
        }));
      }
      return [];
    },
    staleTime: 10 * 60 * 1000,
  });
};
