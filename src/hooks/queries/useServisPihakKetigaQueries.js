import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ServisPihakKetigaApi from '../../api/ServisPihakKetigaApi';
import { queryKeys } from '../../lib/queryKeys';

/** jenis: 'aduan' | 'pemeliharaan' | 'inventaris'. */
export const useServisPihakKetiga = (jenis, id, { enabled = true } = {}) => {
  return useQuery({
    queryKey: queryKeys.servis.list(jenis, id),
    queryFn: () => ServisPihakKetigaApi.list(jenis, id),
    enabled: !!id && enabled,
  });
};

// Laporan baru/terhapus mengubah daftar laporan, jumlah_servis di daftar & detail, dan riwayat per alat.
const invalidateServis = (queryClient) => {
  queryClient.invalidateQueries({ queryKey: queryKeys.servis.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.aduan.all });
  queryClient.invalidateQueries({ queryKey: queryKeys.pemeliharaan.all });
};

export const useTambahServisPihakKetiga = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jenis, id, data }) => ServisPihakKetigaApi.tambah(jenis, id, data),
    onSuccess: () => invalidateServis(queryClient),
  });
};

export const useHapusServisPihakKetiga = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => ServisPihakKetigaApi.hapus(id),
    onSuccess: () => invalidateServis(queryClient),
  });
};
