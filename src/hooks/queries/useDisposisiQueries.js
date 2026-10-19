import { useQuery } from '@tanstack/react-query';
import DisposisiApi from '../../api/DisposisiApi';

/** Data aduan untuk halaman disposisi publik (token dari tautan WhatsApp). */
export const useDisposisiAduan = (id, token) => {
  return useQuery({
    queryKey: ['disposisi', 'aduan', id, token],
    queryFn: () => DisposisiApi.getAduan(id, token),
    enabled: !!id,
    retry: false,
  });
};

/** Data pemeliharaan untuk halaman disposisi publik (token dari tautan WhatsApp). */
export const useDisposisiPemeliharaan = (id, token) => {
  return useQuery({
    queryKey: ['disposisi', 'pemeliharaan', id, token],
    queryFn: async () => {
      const res = await DisposisiApi.getPemeliharaan(id, token);
      return res.data;
    },
    enabled: !!id,
    retry: false,
  });
};
