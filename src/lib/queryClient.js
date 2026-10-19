import { QueryClient, MutationCache } from '@tanstack/react-query';

/**
 * Setiap mutation yang berhasil (tambah/ubah/hapus) menandai SEMUA data cache
 * sebagai kedaluwarsa dan memuat ulang query yang sedang tampil, sehingga daftar,
 * dashboard, laporan, dan dropdown langsung menampilkan data terbaru tanpa refresh
 * manual. Mutation yang tidak mengubah data bisnis (mis. tandai notifikasi dibaca)
 * dapat melewatinya dengan `meta: { skipInvalidate: true }`.
 *
 * Pemuatan ulang berjalan di latar belakang (tidak ditunggu), supaya modal/navigasi
 * setelah `await mutateAsync(...)` tidak tertahan oleh query lain yang sedang aktif.
 */
export const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onSuccess: (_data, _variables, _context, mutation) => {
      if (mutation.meta?.skipInvalidate) return;
      queryClient.invalidateQueries();
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      // Kesalahan 4xx (token, izin, validasi, tidak ditemukan) tidak akan berubah
      // bila diulang; hanya gangguan jaringan/server yang dicoba lagi.
      retry: (failureCount, error) => {
        const status = error?.response?.status;
        if (status && status >= 400 && status < 500) return false;
        return failureCount < 1;
      },
    },
    mutations: {
      // Jangan pernah mengulang tambah/ubah/hapus otomatis: request yang timeout
      // bisa saja sudah diproses server dan akan menghasilkan data ganda.
      retry: false,
    },
  },
});

/**
 * Untuk perubahan data yang dikirim langsung lewat API (tanpa useMutation):
 * panggil setelah request berhasil agar cache ikut diperbarui.
 */
export const refreshAllData = () => queryClient.invalidateQueries();

/** Hapus seluruh cache, mis. saat login/logout agar data pengguna lain tidak terbawa. */
export const clearAllData = () => queryClient.clear();
