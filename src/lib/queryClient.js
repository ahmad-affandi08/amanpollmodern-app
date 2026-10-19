import { QueryClient, MutationCache } from '@tanstack/react-query';

/**
 * Setiap mutation yang berhasil (tambah/ubah/hapus) menandai SEMUA data cache
 * sebagai kedaluwarsa dan memuat ulang query yang sedang tampil, sehingga daftar,
 * dashboard, laporan, dan dropdown langsung menampilkan data terbaru tanpa refresh
 * manual. Mutation yang tidak mengubah data bisnis (mis. tandai notifikasi dibaca)
 * dapat melewatinya dengan `meta: { skipInvalidate: true }`.
 */
export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      if (mutation.meta?.skipInvalidate) return undefined;
      return queryClient.invalidateQueries();
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
    mutations: {
      retry: 1,
    },
  },
});

/**
 * Untuk perubahan data yang dikirim langsung lewat API (tanpa useMutation):
 * panggil setelah request berhasil agar cache ikut diperbarui.
 */
export const refreshAllData = () => queryClient.invalidateQueries();
