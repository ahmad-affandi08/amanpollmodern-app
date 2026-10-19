export const ROLES = {
  SUPER_ADMIN: 1,
  USER_RUANGAN: 2,
  TEKNISI: 3,
  ADMIN_DIVISI: 4,
  PIMPINAN: 5
};


export const ALL_ROLES = Object.values(ROLES);


/** Teknisi dan User Ruangan memakai tampilan mobile (/mobile/*), peran lain memakai desktop. */
export const isMobileRole = (roleId) => {
  const id = parseInt(roleId);
  return id === ROLES.TEKNISI || id === ROLES.USER_RUANGAN;
};


/** ID peran numerik dari objek user (null bila belum login). */
export const getRoleId = (user) => {
  const id = parseInt(user?.kategori_user_id, 10);
  return Number.isNaN(id) ? null : id;
};

export const hasRole = (user, roles) => roles.includes(getRoleId(user));

export const isRole = (user, role) => getRoleId(user) === role;


/**
 * Sumber tunggal hak akses. Dipakai oleh daftar rute (App.jsx), menu sidebar,
 * dan pengecekan di halaman, supaya menu dan guard rute tidak lagi berbeda.
 *
 * Pimpinan bersifat baca-saja: boleh melihat, tidak boleh menambah/mengubah.
 */
export const ACCESS = {
  dashboard: ALL_ROLES,

  // Desktop
  inventarisView: [ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI, ROLES.PIMPINAN],
  // Sama dengan aturan canManage di backend (peran 1, 3, 4).
  inventarisManage: [ROLES.SUPER_ADMIN, ROLES.TEKNISI, ROLES.ADMIN_DIVISI],
  masterKategori: [ROLES.SUPER_ADMIN],
  masterNamaAlat: [ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI],
  alatBaru: [ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI],
  aduan: [ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI, ROLES.PIMPINAN],
  pemeliharaan: [ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI, ROLES.PIMPINAN],
  scanner: [ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI, ROLES.PIMPINAN],
  report: [ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI, ROLES.PIMPINAN],
  anggaranPengaturan: [ROLES.SUPER_ADMIN],
  anggaran: [ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI, ROLES.PIMPINAN],
  users: [ROLES.SUPER_ADMIN],
  konfigurasi: [ROLES.SUPER_ADMIN],
  analisis: [ROLES.SUPER_ADMIN, ROLES.PIMPINAN],

  // Mobile
  mobile: [ROLES.TEKNISI, ROLES.USER_RUANGAN],
  mobileTeknisi: [ROLES.TEKNISI],
  mobileUserRuangan: [ROLES.USER_RUANGAN],
};


/** Boleh menambah/mengubah/menghapus inventaris. */
export const canManageInventaris = (user) => hasRole(user, ACCESS.inventarisManage);

/** Pimpinan hanya boleh melihat. */
export const isReadOnlyRole = (user) => isRole(user, ROLES.PIMPINAN);
