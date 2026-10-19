import { useQuery } from '@tanstack/react-query';
import AnalisisApi from '../../api/AnalisisApi';

/**
 * Hook halaman Analisis. Semua endpoint /analisis membalas `{ status, data: {...} }`;
 * hook mengembalikan isi `data`-nya. Data ikut disegarkan otomatis bila ada
 * perubahan (mutation) di bagian lain aplikasi.
 */

const ANALISIS_KEY = ['analisis'];

/** Ambil isi `data` dari respons axios. */
const unwrap = (response) => response.data?.data ?? null;

export const useAnalisisKeandalan = () => {
  return useQuery({
    queryKey: [...ANALISIS_KEY, 'keandalan'],
    queryFn: async () => unwrap(await AnalisisApi.getKeandalanAlat()),
  });
};

export const useAnalisisKinerja = () => {
  return useQuery({
    queryKey: [...ANALISIS_KEY, 'kinerja'],
    queryFn: async () => unwrap(await AnalisisApi.getKinerjaTeknisi()),
  });
};

export const useAnalisisRuangan = () => {
  return useQuery({
    queryKey: [...ANALISIS_KEY, 'ruangan'],
    queryFn: async () => unwrap(await AnalisisApi.getSebaranRuangan()),
  });
};

export const useAnalisisBiaya = () => {
  return useQuery({
    queryKey: [...ANALISIS_KEY, 'biaya'],
    queryFn: async () => unwrap(await AnalisisApi.getBiaya()),
  });
};

export const useAnalisisKalibrasi = () => {
  return useQuery({
    queryKey: [...ANALISIS_KEY, 'kalibrasi'],
    queryFn: async () => unwrap(await AnalisisApi.getKalibrasi()),
  });
};
