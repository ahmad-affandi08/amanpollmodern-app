import { useMutation, useQueryClient } from '@tanstack/react-query';
import DisposisiApi from '../../api/DisposisiApi';
import { useToast } from '../../components/Alert/useToast';

/**
 * Create disposisi for Aduan
 */
export const useCreateDisposisiAduan = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ aduanId, data, token }) =>
      DisposisiApi.createDisposisiAduan(aduanId, data, token),
    onSuccess: (response) => {
      showToast(response.data.message || 'Disposisi berhasil disimpan', 'success');
      queryClient.invalidateQueries({ queryKey: ['aduan'] });
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
  const { showToast } = useToast();

  return useMutation({
    mutationFn: ({ pemeliharaanId, data, token }) =>
      DisposisiApi.createDisposisiPemeliharaan(pemeliharaanId, data, token),
    onSuccess: (response) => {
      showToast(response.data.message || 'Disposisi berhasil disimpan', 'success');

      queryClient.invalidateQueries({ queryKey: ['pemeliharaan'] });
    },
    onError: (error) => {
      const message =
        error.response?.data?.message || 'Gagal menyimpan disposisi';
      showToast(message, 'error');
    },
  });
};
