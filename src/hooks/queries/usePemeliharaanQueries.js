import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import PemeliharaanApi from '../../api/PemeliharaanApi';
import { queryKeys } from '../../lib/queryKeys';

// Get all pemeliharaan with filters
export const usePemeliharaan = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.pemeliharaan.list(filters),
    queryFn: async () => {
      const res = await PemeliharaanApi.getAll(filters);
      return {
        data: res.data || [],
        meta: res.meta,
      };
    },
  });
};

// Get pemeliharaan assignments for teknisi (infinite scroll)
export const usePemeliharaanAssignments = (limit = 10, search = '', status = 'all', kondisi = 'all', month = null, year = null) => {
  return useInfiniteQuery({
    queryKey: ['pemeliharaan', 'assignments', { search, status, kondisi, month, year }],
    queryFn: ({ pageParam = 1 }) => PemeliharaanApi.getAssignments(pageParam, limit, search, status, kondisi, month, year),
    getNextPageParam: (lastPage) => {
      // Laravel pagination returns meta with current_page and last_page
      const currentPage = lastPage.meta?.current_page || lastPage.current_page;
      const lastPageNum = lastPage.meta?.last_page || lastPage.last_page;

      return currentPage < lastPageNum ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });
};

// Get single pemeliharaan
export const usePemeliharaanDetail = (id) => {
  return useQuery({
    queryKey: queryKeys.pemeliharaan.detail(id),
    queryFn: async () => {
      const res = await PemeliharaanApi.getById(id);
      return res.data;
    },
    enabled: !!id,
  });
};

// Create pemeliharaan mutation
export const useCreatePemeliharaan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => PemeliharaanApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pemeliharaan.lists() });
    },
  });
};

// Update pemeliharaan mutation
export const useUpdatePemeliharaan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => PemeliharaanApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pemeliharaan.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.pemeliharaan.detail(variables.id) });
    },
  });
};

// Delete pemeliharaan mutation
export const useDeletePemeliharaan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => PemeliharaanApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pemeliharaan.lists() });
    },
  });
};

// Get form data for pemeliharaan
export const useFormPemeliharaan = (id) => {
  return useQuery({
    queryKey: ['pemeliharaan', 'form', id],
    queryFn: () => PemeliharaanApi.getFormData(id),
    enabled: !!id,
  });
};

// Submit pemeliharaan form
export const useSubmitPemeliharaan = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => PemeliharaanApi.submitForm(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pemeliharaan.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.pemeliharaan.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['pemeliharaan', 'assignments'] });
    },
  });
};

// Update signature (teknisi or kepala ruang)
export const useUpdateSignature = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => PemeliharaanApi.updateSignature(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.pemeliharaan.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.pemeliharaan.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['pemeliharaan', 'assignments'] });
    },
  });
};

