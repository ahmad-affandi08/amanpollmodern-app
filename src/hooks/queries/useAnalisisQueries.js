import { keepPreviousData, useQuery } from '@tanstack/react-query';
import AnalisisApi from '../../api/AnalisisApi';

/**
 * Hook halaman Analisis. Semua endpoint /analisis membalas `{ status, data: {...} }`;
 * hook mengembalikan isi `data`-nya. Data ikut disegarkan otomatis bila ada
 * perubahan (mutation) di bagian lain aplikasi.
 */

const ANALISIS_KEY = ['analisis'];

/** Ambil isi `data` dari respons axios. */
const unwrap = (response) => response.data?.data ?? null;

/**
 * Satu hook per halaman ringkasan. `filter` = { periode, divisiId }; data lama tetap tampil
 * (redup) selama data periode/divisi baru dimuat, jadi halaman tidak berkedip.
 */
const buatHook = (nama, ambil) => function useRingkasan(filter = {}) {
  return useQuery({
    queryKey: [...ANALISIS_KEY, nama, { periode: filter.periode || null, divisiId: filter.divisiId || null, kategoriId: filter.kategoriId || null }],
    queryFn: async () => unwrap(await ambil({ periode: filter.periode || undefined, divisi_id: filter.divisiId || undefined, kategori_id: filter.kategoriId || undefined })),
    placeholderData: keepPreviousData,
  });
};

export const useAnalisisKeandalan = buatHook('keandalan', AnalisisApi.getKeandalanAlat);
export const useAnalisisKinerja = buatHook('kinerja', AnalisisApi.getKinerjaTeknisi);
export const useAnalisisRuangan = buatHook('ruangan', AnalisisApi.getSebaranRuangan);
export const useAnalisisBiaya = buatHook('biaya', AnalisisApi.getBiaya);
export const useAnalisisKalibrasi = buatHook('kalibrasi', AnalisisApi.getKalibrasi);
export const useAnalisisRisiko = buatHook('risiko', AnalisisApi.getRisiko);

/** Realisasi SKI satu teknisi untuk satu bulan. Dimuat hanya bila `enabled` (mis. teknisi sudah dipilih). */
export const useAnalisisRealisasiSki = ({ teknisiId, bulan, tahun }, { enabled = true } = {}) => {
  return useQuery({
    queryKey: [...ANALISIS_KEY, 'ski', { teknisiId: teknisiId || null, bulan, tahun }],
    queryFn: async () => unwrap(await AnalisisApi.getRealisasiSki({ teknisi_id: teknisiId || undefined, bulan, tahun })),
    enabled,
    placeholderData: keepPreviousData,
  });
};
