export const ROLES = {
  SUPER_ADMIN: 1,
  USER_RUANGAN: 2,
  TEKNISI: 3,
  ADMIN_DIVISI: 4,
  PIMPINAN: 5
};


export const ALL_ROLES = Object.values(ROLES);


export const isMobileRole = (roleId) => {
  const id = parseInt(roleId);
  return id === ROLES.TEKNISI || id === ROLES.USER_RUANGAN;
};


export const MENU_PERMISSIONS = {
  'dashboard': ALL_ROLES,
  'inventaris': [ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI],
  'aduan': [ROLES.SUPER_ADMIN, ROLES.USER_RUANGAN, ROLES.TEKNISI, ROLES.ADMIN_DIVISI],
  'pemeliharaan': [ROLES.SUPER_ADMIN, ROLES.TEKNISI, ROLES.ADMIN_DIVISI],
  'report': [ROLES.SUPER_ADMIN, ROLES.ADMIN_DIVISI, ROLES.PIMPINAN],
  'anggaran': [ROLES.SUPER_ADMIN, ROLES.PIMPINAN],
  'pengguna': [ROLES.SUPER_ADMIN],
  'scanner': [ROLES.SUPER_ADMIN, ROLES.TEKNISI, ROLES.USER_RUANGAN],
};
