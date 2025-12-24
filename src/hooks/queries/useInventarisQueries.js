import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import InventarisApi from '../../api/InventarisApi';
import { queryKeys } from '../../lib/queryKeys';

// Get all inventaris with filters
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

// Get single inventaris
export const useInventarisDetail = (id) => {
  return useQuery({
    queryKey: queryKeys.inventaris.detail(id),
    queryFn: async () => {
      const res = await InventarisApi.getById(id);
      return res; // Ensure response structure matches InventarisResource
    },
    enabled: !!id && id !== 'undefined' && id !== 'null',
  });
};

// Create inventaris mutation
export const useCreateInventaris = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => InventarisApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventaris.lists() });
    },
  });
};

// Update inventaris mutation
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

// Update location mutation
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

// Delete inventaris mutation
export const useDeleteInventaris = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => InventarisApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventaris.lists() });
    },
  });
};
