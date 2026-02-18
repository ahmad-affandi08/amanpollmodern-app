import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import AlatBaruApi from '../../api/AlatBaruApi';


export const useAlatBaru = (params = {}) => {
  return useInfiniteQuery({
    queryKey: ['alat-baru', params],
    queryFn: ({ pageParam = 1 }) =>
      AlatBaruApi.getAlatBaru({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.data.meta;
      return current_page < last_page ? current_page + 1 : undefined;
    },
    select: (data) => ({
      pages: data.pages.flatMap((page) => page.data.data),
      pageParams: data.pageParams,
    }),
  });
};


export const useAlatBaruDetail = (id) => {
  return useQuery({
    queryKey: ['alat-baru', id],
    queryFn: () => AlatBaruApi.getAlatBaruDetail(id),
    enabled: !!id,
  });
};


export const useCreateAlatBaru = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData) => AlatBaruApi.createAlatBaru(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alat-baru'] });
    },
  });
};


export const useDeleteAlatBaru = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => AlatBaruApi.deleteAlatBaru(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alat-baru'] });
    },
  });
};


export const useApproveAlatBaru = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => AlatBaruApi.approveAlatBaru(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alat-baru'] });
      queryClient.invalidateQueries({ queryKey: ['inventaris'] });
    },
  });
};
