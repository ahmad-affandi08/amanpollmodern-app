import { useMemo } from 'react';
import { useAuth, useMasterUsers } from '../../../hooks';
import { ROLES, isRole } from '../../auth/constants';

/**
 * Opsi dropdown teknisi untuk halaman laporan (sama dengan daftar pemeliharaan):
 * dimuat dengan `category: 'teknisi'`, dan untuk Admin Divisi dibatasi ke divisinya.
 */
export default function useTeknisiOptions() {
  const { user } = useAuth();
  const divisiId = isRole(user, ROLES.ADMIN_DIVISI) ? user?.divisi_id : undefined;

  const filters = { per_page: 500, category: 'teknisi' };
  if (divisiId) filters.divisi_id = divisiId;

  const { data } = useMasterUsers(filters);

  return useMemo(
    () => (data?.data || [])
      .filter((u) => (u.role || '').toLowerCase() === 'teknisi')
      .map((u) => ({ label: u.nama_lengkap, value: u.id_user })),
    [data]
  );
}
