import { useQuery, useMutation, keepPreviousData } from '@tanstack/react-query';
import RisikoApi from '../../api/RisikoApi';

// Mutation berhasil -> seluruh cache ditandai kedaluwarsa oleh lib/queryClient, tidak perlu invalidate manual.

export const useRisikoRegister = (filters = {}) =>
  useQuery({
    queryKey: ['risiko', 'register', filters],
    queryFn: async () => {
      const res = await RisikoApi.getRegister(filters);
      return { data: res.data || [], meta: res.meta };
    },
    placeholderData: keepPreviousData,
  });

export const useRisikoRingkasan = () =>
  useQuery({ queryKey: ['risiko', 'ringkasan'], queryFn: RisikoApi.getRingkasan });

export const useNilaiMassalRisiko = () => useMutation({ mutationFn: RisikoApi.nilaiMassal });

export const useTerapkanIntervalRisiko = () => useMutation({ mutationFn: RisikoApi.terapkanInterval });
