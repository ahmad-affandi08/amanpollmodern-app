import { useMutation, useQueryClient } from '@tanstack/react-query';
import { disposisiApi } from '../../api/DisposisiApi';
import { useContext } from 'react';
import { ToastContext } from '../../components/Alert/ToastProvider';

/**
 * Create disposisi for Aduan
 */
export const useCreateDisposisiAduan = () => {
  const queryClient = useQueryClient();
  const { showToast } = useContext(ToastContext);

  return useMutation({
    mutationFn: ({ aduanId, data }) =>
      disposisiApi.createDisposisiAduan(aduanId, data),
    onSuccess: (response) => {
      showToast(response.data.message || 'Disposisi berhasil disimpan', 'success');
    },
    onError: (error) => {
      console.error('Error saving disposisi:', error);
      const message = error.response?.data?.message || 'Gagal menyimpan disposisi';
      showToast(message, 'error');
    },
  });
};

/**
 * Create disposisi for Pemeliharaan
 */
export const useCreateDisposisiPemeliharaan = () => {
  const queryClient = useQueryClient();
  const { showToast } = useContext(ToastContext);

  return useMutation({
    mutationFn: ({ pemeliharaanId, data }) =>
      disposisiApi.createDisposisiPemeliharaan(pemeliharaanId, data),
    onSuccess: (response) => {
      showToast(response.data.message || 'Disposisi berhasil disimpan', 'success');
      // Invalidate pemeliharaan queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['pemeliharaan'] });
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || 'Gagal menyimpan disposisi';
      showToast(message, 'error');
    },
  });
};
