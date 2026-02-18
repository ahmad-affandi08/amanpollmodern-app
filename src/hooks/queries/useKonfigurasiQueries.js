import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import KonfigurasiApi from '../../api/KonfigurasiApi';
import { queryKeys } from '../../lib/queryKeys';


export const useFonnteConfig = () => {
  return useQuery({
    queryKey: queryKeys.konfigurasi.fonnte(),
    queryFn: async () => {
      const res = await KonfigurasiApi.getFonnteConfig();
      return res.data || {};
    },
  });
};


export const useSaveFonnteConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => KonfigurasiApi.saveFonnteConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.konfigurasi.all });
    },
  });
};


export const useTestFonnteConnection = () => {
  return useMutation({
    mutationFn: (apiToken) => KonfigurasiApi.testFonnteConnection(apiToken),
  });
};
