import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ProfileApi from '../../api/ProfileApi';

// Keys
export const PROFILE_KEYS = {
  all: ['profile'],
  detail: () => [...PROFILE_KEYS.all, 'detail']
};

/**
 * Hook to fetch user profile
 */
export const useProfile = () => {
  return useQuery({
    queryKey: PROFILE_KEYS.detail(),
    queryFn: ProfileApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1
  });
};

/**
 * Hook to change password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: ProfileApi.changePassword
  });
};
