import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import MasterApi from '../../api/MasterApi';
import KategoriAlatApi from '../../api/KategoriAlatApi';
import NamaAlatApi from '../../api/NamaAlatApi';
import { queryKeys } from '../../lib/queryKeys';


export const useMasterUsers = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.master.users(filters),
    queryFn: async () => {
      const res = await MasterApi.getAllUsers(filters);
      return {
        data: res.data || [],
        meta: res.meta,
      };
    },
  });
};

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => MasterApi.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master', 'users'] });
    },
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => MasterApi.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master', 'users'] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => MasterApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master', 'users'] });
    },
  });
};


export const useMasterRuangan = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.master.ruangan(filters),
    queryFn: async () => {

      const params = { ...filters, all: 1 };
      const res = await MasterApi.getAllRuangan(params);
      return {
        data: res.data || res || [],
        meta: res.meta,
      };
    },
  });
};

export const useCreateRuangan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => MasterApi.createRuangan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master', 'ruangan'] });
    },
  });
};

export const useUpdateRuangan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => MasterApi.updateRuangan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master', 'ruangan'] });
    },
  });
};

export const useDeleteRuangan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => MasterApi.deleteRuangan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master', 'ruangan'] });
    },
  });
};


export const useMasterDivisi = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.master.divisi(filters),
    queryFn: async () => {
      const res = await MasterApi.getAllDivisi(filters);
      return {
        data: res.data || [],
        meta: res.meta,
      };
    },
  });
};

export const useCreateDivisi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => MasterApi.createDivisi(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master', 'divisi'] });
    },
  });
};

export const useUpdateDivisi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => MasterApi.updateDivisi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master', 'divisi'] });
    },
  });
};

export const useDeleteDivisi = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => MasterApi.deleteDivisi(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master', 'divisi'] });
    },
  });
};


export const useMasterNamaAlat = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.master.namaAlat(filters),
    queryFn: async () => {
      const res = await NamaAlatApi.getAll(filters);

      if (Array.isArray(res)) {
        return { data: res, meta: null };
      }
      return {
        data: res.data || res || [],
        meta: res.meta,
      };
    },
  });
};

export const useCreateNamaAlat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => NamaAlatApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master', 'namaAlat'] });
    },
  });
};

export const useUpdateNamaAlat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => NamaAlatApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master', 'namaAlat'] });
    },
  });
};

export const useDeleteNamaAlat = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => NamaAlatApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master', 'namaAlat'] });
    },
  });
};


export const useMasterKategori = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.master.kategori(filters),
    queryFn: async () => {
      const res = await KategoriAlatApi.getAll(filters);

      if (Array.isArray(res)) {
        return { data: res, meta: null };
      }
      return {
        data: res.data || res || [],
        meta: res.meta,
      };
    },
  });
};

export const useCreateKategori = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data) => KategoriAlatApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master', 'kategori'] });
    },
  });
};

export const useUpdateKategori = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => KategoriAlatApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master', 'kategori'] });
    },
  });
};

export const useDeleteKategori = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => KategoriAlatApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['master', 'kategori'] });
    },
  });
};

export const useMasterData = {
  users: useMasterUsers,
  ruangan: useMasterRuangan,
  divisi: useMasterDivisi,
  namaAlat: useMasterNamaAlat,
  kategori: useMasterKategori,
};
