import { useMemo } from 'react';
import { useMasterUsers, useAuth } from '../../../hooks';
import { ROLES, isRole } from '../../auth/constants';

/**
 * Daftar teknisi untuk filter dan pilihan penugasan (aduan & pemeliharaan).
 * Satu cara yang sama di semua halaman: filter `category: 'teknisi'` di server,
 * dan Admin Divisi hanya melihat teknisi dari divisinya sendiri.
 *
 * @returns {Array<{ id_user, nama_lengkap, divisi_id }>}
 */
export default function useTeknisiList() {
  const { user } = useAuth();
  const isAdminDivisi = isRole(user, ROLES.ADMIN_DIVISI);
  const userDivisiId = user?.divisi_id;
  const scopeToDivisi = isAdminDivisi && !!userDivisiId;

  const params = { per_page: 500, category: 'teknisi' };
  if (scopeToDivisi) {
    params.divisi_id = userDivisiId;
  }

  const { data } = useMasterUsers(params);

  return useMemo(() => {
    const list = data?.data || [];
    // Pengaman tambahan bila API mengembalikan teknisi divisi lain.
    return scopeToDivisi
      ? list.filter(u => String(u.divisi_id) === String(userDivisiId))
      : list;
  }, [data, scopeToDivisi, userDivisiId]);
}
