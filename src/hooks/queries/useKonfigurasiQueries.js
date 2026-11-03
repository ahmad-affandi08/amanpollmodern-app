import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import KonfigurasiApi from '../../api/KonfigurasiApi';
import { queryKeys } from '../../lib/queryKeys';


export const useWhatsAppConfig = () => {
  return useQuery({
    queryKey: queryKeys.konfigurasi.whatsapp(),
    queryFn: async () => {
      const res = await KonfigurasiApi.getWhatsAppConfig();
      return res.data || {};
    },
  });
};


export const useSaveWhatsAppConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => KonfigurasiApi.saveWhatsAppConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.konfigurasi.all });
    },
  });
};


export const useTestWhatsAppConnection = () => {
  return useMutation({
    mutationFn: (data) => KonfigurasiApi.testWhatsAppConnection(data),
  });
};
