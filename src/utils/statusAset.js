import { ROLES, getRoleId } from '../features/auth/constants';

export const STATUS_ASET = {
  AKTIF: 'Aktif',
  DIGUDANGKAN: 'Digudangkan',
  DIHAPUS: 'Dihapus',
};

export const TINDAK_LANJUT = ['Dijual', 'Dipertukarkan', 'Dihibahkan', 'Dimusnahkan', 'Lainnya'];

/** Sama dengan aturan di backend (InventarisStatusService): hanya Super Admin dan Admin Divisi yang menghapus. */
const PENGHAPUS = [ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI];

export const statusAsetOf = (item) => item?.status_aset || STATUS_ASET.AKTIF;

export const isNonAktif = (item) => statusAsetOf(item) !== STATUS_ASET.AKTIF;

/** Status tujuan yang boleh dipilih pengguna dari status alat saat ini. */
export const statusTujuanFor = (user, statusSaatIni) => {
  const role = getRoleId(user);
  const bolehHapus = PENGHAPUS.includes(role);

  switch (statusSaatIni) {
    case STATUS_ASET.AKTIF:
      return [STATUS_ASET.DIGUDANGKAN, ...(bolehHapus ? [STATUS_ASET.DIHAPUS] : [])];
    case STATUS_ASET.DIGUDANGKAN:
      return [...(bolehHapus ? [STATUS_ASET.DIHAPUS] : []), STATUS_ASET.AKTIF];
    case STATUS_ASET.DIHAPUS:
      return role === ROLES.SUPER_ADMIN ? [STATUS_ASET.AKTIF] : [];
    default:
      return [];
  }
};

/** Pesan galat dari respons API (validasi 422 atau pesan domain). */
export const apiErrorMessage = (error, fallback) => {
  const errors = error?.response?.data?.errors;
  if (errors) return Object.values(errors).flat().join(', ');
  return error?.response?.data?.message || fallback;
};

export const STATUS_ASET_STYLE = {
  [STATUS_ASET.AKTIF]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [STATUS_ASET.DIGUDANGKAN]: 'bg-amber-50 text-amber-700 border-amber-200',
  [STATUS_ASET.DIHAPUS]: 'bg-gray-100 text-gray-600 border-gray-300',
};
