import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import InventarisApi from '../../api/InventarisApi';
import { queryKeys } from '../../lib/queryKeys';


export const useInventaris = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.inventaris.list(filters),
    queryFn: async () => {
      const res = await InventarisApi.getAll(filters);
      return {
        data: res.data || [],
        meta: res.meta,
      };
    },
  });
};


export const useInventarisDetail = (id) => {
  return useQuery({
    queryKey: queryKeys.inventaris.detail(id),
    queryFn: async () => {
      const res = await InventarisApi.getById(id);
      return res;
    },
    enabled: !!id && id !== 'undefined' && id !== 'null',
  });
};


export const useCreateInventaris = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => InventarisApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventaris.lists() });
    },
  });
};


export const useUpdateInventaris = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => InventarisApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventaris.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventaris.detail(variables.id) });
    },
  });
};


export const useUpdateLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ruanganId }) => InventarisApi.updateLocation(id, ruanganId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventaris.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventaris.detail(variables.id) });
    },
  });
};


const invalidateKalibrasi = (queryClient, inventarisId) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.inventaris.lists() });
  queryClient.invalidateQueries({ queryKey: queryKeys.inventaris.detail(inventarisId) });
  queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
};


export const useAddKalibrasi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => InventarisApi.addKalibrasi(id, data),
    onSuccess: (_, variables) => invalidateKalibrasi(queryClient, variables.id),
  });
};


export const useDeleteKalibrasi = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, historyId }) => InventarisApi.deleteKalibrasi(id, historyId),
    onSuccess: (_, variables) => invalidateKalibrasi(queryClient, variables.id),
  });
};


export const useDeleteInventaris = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => InventarisApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventaris.lists() });
    },
  });
};
