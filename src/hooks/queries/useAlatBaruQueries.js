import { useQuery, useMutation, useQueryClient, useInfiniteQuery, keepPreviousData } from '@tanstack/react-query';
import AlatBaruApi from '../../api/AlatBaruApi';


/** Daftar bertingkat per halaman (desktop): { data, meta } dengan kontrol halaman. */
export const useAlatBaru = (params = {}) => {
  return useQuery({
    queryKey: ['alat-baru', 'list', params],
    queryFn: async () => {
      const res = await AlatBaruApi.getAlatBaru(params);
      return {
        data: res.data?.data ?? [],
        meta: res.data?.meta,
      };
    },
    placeholderData: keepPreviousData,
  });
};


/** Daftar "muat lebih banyak" (mobile): semua halaman yang sudah dimuat digabung. */
export const useAlatBaruInfinite = (params = {}) => {
  return useInfiniteQuery({
    queryKey: ['alat-baru', 'infinite', params],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      AlatBaruApi.getAlatBaru({ ...params, page: pageParam }),
    getNextPageParam: (lastPage) => {
      const { current_page, last_page } = lastPage.data?.meta ?? {};
      return current_page && last_page && current_page < last_page ? current_page + 1 : undefined;
    },
    select: (data) => ({
      pages: data.pages.flatMap((page) => page.data?.data ?? []),
      pageParams: data.pageParams,
    }),
  });
};


export const useAlatBaruDetail = (id) => {
  return useQuery({
    queryKey: ['alat-baru', 'detail', id],
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
