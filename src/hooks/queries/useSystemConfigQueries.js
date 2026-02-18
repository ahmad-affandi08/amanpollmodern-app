import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import InstitutionConfigApi from '../../api/SystemConfigApi';

export const useInstitutionConfig = () => {
  return useQuery({
    queryKey: ['institution', 'config'],
    queryFn: InstitutionConfigApi.getConfig,
  });
};

export const useUpdateInstitutionConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: InstitutionConfigApi.updateConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution', 'config'] });
    },
  });
};

export const useUploadLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: InstitutionConfigApi.uploadLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['institution', 'config'] });
    },
  });
};
